"use client"

import { useState, useEffect } from "react"
import { Camera, History, TrendingUp, Star, MapPin, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ProfileMenu from "./profile-menu"
import CameraCapture from "./camera-capture"
import MenuAnalysis from "./menu-analysis"
import DishSelection from "./dish-selection"
import RatingInterface from "./rating-interface"
import RecipeDiscovery from "./recipe-discovery"
import VisitTimeline from "./visit-timeline"
import type { RestaurantVisit } from "@/types"
import { createClient } from "@/lib/supabase/client"

interface User {
  id: string
  email: string
  display_name?: string
  avatar_url?: string
}

interface DashboardProps {
  user: User
}

type AppState = "dashboard" | "camera" | "analyzing" | "dish-selection" | "rating" | "recipe-discovery" | "timeline"

export default function Dashboard({ user }: DashboardProps) {
  const [appState, setAppState] = useState<AppState>("dashboard")
  const [visits, setVisits] = useState<RestaurantVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Temporary state for current visit flow
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null)
  const [extractedDishes, setExtractedDishes] = useState<any[]>([])
  const [selectedDishes, setSelectedDishes] = useState<any[]>([])
  const [selectedDishForRecipe, setSelectedDishForRecipe] = useState<string>("")

  const supabase = createClient()

  useEffect(() => {
    loadVisits()
  }, [])

  const loadVisits = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurant_visits")
        .select(`
          *,
          dishes (*)
        `)
        .eq("user_id", user.id)
        .order("visit_date", { ascending: false })

      if (error) throw error

      const formattedVisits: RestaurantVisit[] = data.map((visit) => ({
        id: visit.id,
        restaurantName: visit.restaurant_name,
        location: visit.location,
        date: visit.visit_date,
        menuPhoto: visit.menu_photo_url,
        notes: visit.notes,
        dishes: visit.dishes.map((dish: any) => ({
          id: dish.id,
          name: dish.name,
          description: dish.description,
          price: dish.price,
          category: dish.category,
          rating: dish.rating || 0,
          notes: dish.notes,
          wantToRecreate: dish.want_to_recreate,
        })),
      }))

      setVisits(formattedVisits)
    } catch (error) {
      console.error("Error loading visits:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoCapture = (photo: string) => {
    setCurrentPhoto(photo)
    setAppState("analyzing")
  }

  const handleDishesExtracted = (dishes: any[]) => {
    setExtractedDishes(dishes)
    setAppState("dish-selection")
  }

  const handleDishesSelected = (dishes: any[]) => {
    setSelectedDishes(dishes)
    setAppState("rating")
  }

  const handleRatingsComplete = async (ratings: any[], visitNotes: string) => {
    try {
      // Create visit record
      const { data: visitData, error: visitError } = await supabase
        .from("restaurant_visits")
        .insert({
          user_id: user.id,
          restaurant_name: "Restaurant Name", // This should come from the form
          location: "Location", // This should come from the form
          visit_date: new Date().toISOString(),
          menu_photo_url: currentPhoto,
          notes: visitNotes,
        })
        .select()
        .single()

      if (visitError) throw visitError

      // Create dish records
      const dishInserts = ratings.map((rating) => ({
        visit_id: visitData.id,
        name: selectedDishes.find((d) => d.id === rating.dishId)?.name || "",
        description: selectedDishes.find((d) => d.id === rating.dishId)?.description,
        price: selectedDishes.find((d) => d.id === rating.dishId)?.price,
        category: selectedDishes.find((d) => d.id === rating.dishId)?.category,
        ordered: true,
        rating: rating.rating,
        notes: rating.notes,
        want_to_recreate: rating.wantToRecreate,
      }))

      const { error: dishError } = await supabase.from("dishes").insert(dishInserts)

      if (dishError) throw dishError

      // Reset state and reload visits
      setCurrentPhoto(null)
      setExtractedDishes([])
      setSelectedDishes([])
      setAppState("dashboard")
      loadVisits()
    } catch (error) {
      console.error("Error saving visit:", error)
    }
  }

  const handleRecipeSearch = (dishName: string) => {
    setSelectedDishForRecipe(dishName)
    setAppState("recipe-discovery")
  }

  const stats = {
    totalVisits: visits.length,
    totalDishes: visits.reduce((sum, visit) => sum + visit.dishes.length, 0),
    averageRating:
      visits.length > 0
        ? visits.reduce((sum, visit) => {
            const visitAvg = visit.dishes.reduce((dishSum, dish) => dishSum + dish.rating, 0) / visit.dishes.length
            return sum + visitAvg
          }, 0) / visits.length
        : 0,
  }

  const filteredVisits = visits.filter(
    (visit) =>
      visit.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.dishes.some((dish) => dish.name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const recentVisits = visits.slice(0, 3)

  if (appState === "camera") {
    return <CameraCapture onPhotoCapture={handlePhotoCapture} onBack={() => setAppState("dashboard")} />
  }

  if (appState === "analyzing" && currentPhoto) {
    return (
      <MenuAnalysis
        photo={currentPhoto}
        onDishesExtracted={handleDishesExtracted}
        onBack={() => setAppState("camera")}
      />
    )
  }

  if (appState === "dish-selection") {
    return (
      <DishSelection
        dishes={extractedDishes}
        onDishesSelected={handleDishesSelected}
        onBack={() => setAppState("analyzing")}
      />
    )
  }

  if (appState === "rating") {
    return (
      <RatingInterface
        dishes={selectedDishes}
        restaurantName="Restaurant Name" // This should come from the form
        location="Location" // This should come from the form
        onRatingsComplete={handleRatingsComplete}
        onBack={() => setAppState("dish-selection")}
      />
    )
  }

  if (appState === "recipe-discovery") {
    return <RecipeDiscovery dishName={selectedDishForRecipe} onBack={() => setAppState("dashboard")} />
  }

  if (appState === "timeline") {
    return (
      <VisitTimeline
        visits={filteredVisits}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBack={() => setAppState("dashboard")}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">FoodTracker</h1>
            <p className="text-sm text-gray-600">Track your culinary journey</p>
          </div>
          <ProfileMenu user={user} stats={stats} />
        </div>
      </div>

      {/* Main content */}
      <div className="p-4 space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">{stats.totalVisits}</div>
              <div className="text-sm text-gray-600">Restaurants</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">{stats.totalDishes}</div>
              <div className="text-sm text-gray-600">Dishes Tried</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">{stats.averageRating.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => setAppState("camera")}
            className="h-24 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          >
            <div className="text-center">
              <Camera className="h-8 w-8 mx-auto mb-2" />
              <div className="font-medium">New Visit</div>
              <div className="text-xs opacity-90">Capture menu</div>
            </div>
          </Button>
          <Button variant="outline" onClick={() => setAppState("timeline")} className="h-24">
            <div className="text-center">
              <History className="h-8 w-8 mx-auto mb-2" />
              <div className="font-medium">View Timeline</div>
              <div className="text-xs text-gray-600">Past visits</div>
            </div>
          </Button>
        </div>

        {/* Recent visits */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                <span>Recent Visits</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setAppState("timeline")}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentVisits.length > 0 ? (
              <div className="space-y-4">
                {recentVisits.map((visit) => {
                  const averageRating = visit.dishes.reduce((sum, dish) => sum + dish.rating, 0) / visit.dishes.length

                  return (
                    <div
                      key={visit.id}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      {visit.menuPhoto && (
                        <img
                          src={visit.menuPhoto || "/placeholder.svg"}
                          alt="Menu"
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 truncate">{visit.restaurantName}</h3>
                            {visit.location && (
                              <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{visit.location}</span>
                              </div>
                            )}
                            <p className="text-sm text-gray-600 mt-1">{new Date(visit.date).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                            <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {visit.dishes.length} dishes
                          </Badge>
                          {visit.dishes.some((dish) => dish.wantToRecreate) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                const dishToRecreate = visit.dishes.find((dish) => dish.wantToRecreate)
                                if (dishToRecreate) {
                                  handleRecipeSearch(dishToRecreate.name)
                                }
                              }}
                              className="text-xs h-6 px-2"
                            >
                              Find Recipes
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No visits yet</h3>
                <p className="text-gray-600 mb-4">Start tracking your restaurant experiences!</p>
                <Button
                  onClick={() => setAppState("camera")}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Visit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
