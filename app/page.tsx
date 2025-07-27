"use client"

import { useState, useEffect } from "react"
import { Camera, Clock, Search, Star, ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import CameraCapture from "@/components/camera-capture"
import MenuAnalysis from "@/components/menu-analysis"
import DishSelection from "@/components/dish-selection"
import RatingInterface from "@/components/rating-interface"
import VisitTimeline from "@/components/visit-timeline"
import type { RestaurantVisit, Dish } from "@/types"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"

export default async function RestaurantTracker() {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  const [currentView, setCurrentView] = useState<"home" | "camera" | "analysis" | "selection" | "rating" | "timeline">(
    "home",
  )
  const [visits, setVisits] = useState<RestaurantVisit[]>([])
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null)
  const [extractedDishes, setExtractedDishes] = useState<Dish[]>([])
  const [selectedDishes, setSelectedDishes] = useState<Dish[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Load visits from localStorage
    const savedVisits = localStorage.getItem("restaurant-visits")
    if (savedVisits) {
      setVisits(JSON.parse(savedVisits))
    }
  }, [])

  const saveVisits = (newVisits: RestaurantVisit[]) => {
    setVisits(newVisits)
    localStorage.setItem("restaurant-visits", JSON.stringify(newVisits))
  }

  const handlePhotoCapture = (photo: string) => {
    setCurrentPhoto(photo)
    setCurrentView("analysis")
  }

  const handleDishesExtracted = (dishes: Dish[]) => {
    setExtractedDishes(dishes)
    setCurrentView("selection")
  }

  const handleDishesSelected = (dishes: Dish[]) => {
    setSelectedDishes(dishes)
    setCurrentView("rating")
  }

  const handleVisitComplete = (visit: RestaurantVisit) => {
    const newVisits = [visit, ...visits]
    saveVisits(newVisits)
    setCurrentView("home")
    setCurrentPhoto(null)
    setExtractedDishes([])
    setSelectedDishes([])
  }

  const filteredVisits = visits.filter(
    (visit) =>
      visit.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.dishes.some((dish) => dish.name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const recentVisits = visits.slice(0, 3)
  const totalDishes = visits.reduce((acc, visit) => acc + visit.dishes.length, 0)
  const averageRating =
    visits.length > 0
      ? visits.reduce(
          (acc, visit) => acc + visit.dishes.reduce((dishAcc, dish) => dishAcc + dish.rating, 0) / visit.dishes.length,
          0,
        ) / visits.length
      : 0

  if (currentView === "camera") {
    return <CameraCapture onPhotoCapture={handlePhotoCapture} onBack={() => setCurrentView("home")} />
  }

  if (currentView === "analysis") {
    return (
      <MenuAnalysis
        photo={currentPhoto!}
        onDishesExtracted={handleDishesExtracted}
        onBack={() => setCurrentView("home")}
      />
    )
  }

  if (currentView === "selection") {
    return (
      <DishSelection
        dishes={extractedDishes}
        onDishesSelected={handleDishesSelected}
        onBack={() => setCurrentView("analysis")}
      />
    )
  }

  if (currentView === "rating") {
    return (
      <RatingInterface
        dishes={selectedDishes}
        onVisitComplete={handleVisitComplete}
        onBack={() => setCurrentView("selection")}
      />
    )
  }

  if (currentView === "timeline") {
    return (
      <VisitTimeline
        visits={filteredVisits}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBack={() => setCurrentView("home")}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dish Discovery</h1>
              <p className="text-sm text-gray-600">Track your culinary journey</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setCurrentView("timeline")} className="p-2">
                <Clock className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search restaurants or dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{visits.length}</div>
              <div className="text-xs text-gray-600">Visits</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{totalDishes}</div>
              <div className="text-xs text-gray-600">Dishes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center space-x-1">
                <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                <div className="text-2xl font-bold text-orange-600">{averageRating.toFixed(1)}</div>
              </div>
              <div className="text-xs text-gray-600">Avg Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3 mb-6">
          <Button
            onClick={() => setCurrentView("camera")}
            className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg"
          >
            <Camera className="mr-3 h-6 w-6" />
            Capture Menu & Track Experience
          </Button>
        </div>

        {/* Recent Visits */}
        {recentVisits.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Visits</h2>
              <Button variant="ghost" size="sm" onClick={() => setCurrentView("timeline")} className="text-orange-600">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentVisits.map((visit) => (
                <Card key={visit.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {visit.menuPhoto && (
                        <img
                          src={visit.menuPhoto || "/placeholder.svg"}
                          alt="Menu"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{visit.restaurantName}</h3>
                        <p className="text-sm text-gray-600 mb-2">{new Date(visit.date).toLocaleDateString()}</p>
                        <div className="flex flex-wrap gap-1">
                          {visit.dishes.slice(0, 2).map((dish, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {dish.name}
                            </Badge>
                          ))}
                          {visit.dishes.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{visit.dishes.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                        <span className="text-sm font-medium">
                          {(visit.dishes.reduce((acc, dish) => acc + dish.rating, 0) / visit.dishes.length).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {visits.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Culinary Journey</h3>
            <p className="text-gray-600 mb-6">Capture menus, track dishes, and discover amazing recipes</p>
            <Button
              onClick={() => setCurrentView("camera")}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
            >
              <Camera className="mr-2 h-4 w-4" />
              Take Your First Photo
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
