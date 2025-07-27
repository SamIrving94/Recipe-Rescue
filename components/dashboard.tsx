"use client"

import { useState, useEffect } from "react"
import { Camera, Search, Star, TrendingUp, BookOpen, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/providers/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { CameraCapture } from "@/components/camera-capture"
import { MenuAnalysis } from "@/components/menu-analysis"
import { DishSelection } from "@/components/dish-selection"
import { RatingInterface } from "@/components/rating-interface"
import { RecipeDiscovery } from "@/components/recipe-discovery"
import { ProfileMenu } from "@/components/profile-menu"
import type { Database } from "@/lib/supabase/types"

type RestaurantVisit = Database["public"]["Tables"]["restaurant_visits"]["Row"] & {
  dishes: Database["public"]["Tables"]["dishes"]["Row"][]
}

type Recipe = Database["public"]["Tables"]["recipes"]["Row"]

export function Dashboard() {
  const { user, profile } = useAuth()
  const [currentView, setCurrentView] = useState<
    "dashboard" | "camera" | "analysis" | "selection" | "rating" | "recipes"
  >("dashboard")
  const [visits, setVisits] = useState<RestaurantVisit[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null)
  const [extractedDishes, setExtractedDishes] = useState<any[]>([])
  const [selectedDishes, setSelectedDishes] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      // Load recent visits with dishes
      const { data: visitsData } = await supabase
        .from("restaurant_visits")
        .select(`
          *,
          dishes (*)
        `)
        .order("visit_date", { ascending: false })
        .limit(10)

      if (visitsData) {
        setVisits(visitsData as RestaurantVisit[])
      }

      // Load recent recipes
      const { data: recipesData } = await supabase
        .from("recipes")
        .select("*")
        .order("saved_at", { ascending: false })
        .limit(10)

      if (recipesData) {
        setRecipes(recipesData)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoCapture = (photo: string) => {
    setCurrentPhoto(photo)
    setCurrentView("analysis")
  }

  const handleDishesExtracted = (dishes: any[]) => {
    setExtractedDishes(dishes)
    setCurrentView("selection")
  }

  const handleDishesSelected = (dishes: any[]) => {
    setSelectedDishes(dishes)
    setCurrentView("rating")
  }

  const handleVisitComplete = async (visitData: any) => {
    await loadData() // Refresh data
    setCurrentView("dashboard")
    setCurrentPhoto(null)
    setExtractedDishes([])
    setSelectedDishes([])
  }

  const filteredVisits = visits.filter(
    (visit) =>
      visit.restaurant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.dishes.some((dish) => dish.name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const stats = {
    totalVisits: visits.length,
    totalDishes: visits.reduce((acc, visit) => acc + visit.dishes.length, 0),
    averageRating:
      visits.length > 0
        ? visits.reduce((acc, visit) => {
            const visitAvg =
              visit.dishes.filter((d) => d.rating).reduce((sum, d) => sum + (d.rating || 0), 0) /
              visit.dishes.filter((d) => d.rating).length
            return acc + (visitAvg || 0)
          }, 0) / visits.length
        : 0,
    savedRecipes: recipes.length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your culinary journey...</p>
        </div>
      </div>
    )
  }

  if (currentView === "camera") {
    return <CameraCapture onPhotoCapture={handlePhotoCapture} onBack={() => setCurrentView("dashboard")} />
  }

  if (currentView === "analysis") {
    return (
      <MenuAnalysis
        photo={currentPhoto!}
        onDishesExtracted={handleDishesExtracted}
        onBack={() => setCurrentView("dashboard")}
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

  if (currentView === "recipes") {
    return <RecipeDiscovery onBack={() => setCurrentView("dashboard")} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Recipe Saver</h1>
              <p className="text-sm text-gray-600">Welcome back, {profile?.display_name || "Chef"}!</p>
            </div>
            <ProfileMenu />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search restaurants, dishes, or recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.totalVisits}</div>
              <div className="text-xs text-gray-600">Restaurant Visits</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.totalDishes}</div>
              <div className="text-xs text-gray-600">Dishes Tried</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center space-x-1">
                <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                <div className="text-2xl font-bold text-orange-600">{stats.averageRating.toFixed(1)}</div>
              </div>
              <div className="text-xs text-gray-600">Avg Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.savedRecipes}</div>
              <div className="text-xs text-gray-600">Saved Recipes</div>
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

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentView("recipes")}
              className="h-12 bg-white border-orange-200 hover:bg-orange-50"
            >
              <BookOpen className="mr-2 h-5 w-5 text-orange-600" />
              <span className="text-orange-600">Discover Recipes</span>
            </Button>
            <Button variant="outline" className="h-12 bg-white border-orange-200 hover:bg-orange-50">
              <TrendingUp className="mr-2 h-5 w-5 text-orange-600" />
              <span className="text-orange-600">Analytics</span>
            </Button>
          </div>
        </div>

        {/* Recent Visits */}
        {filteredVisits.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Visits</h2>
              <Button variant="ghost" size="sm" className="text-orange-600">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {filteredVisits.slice(0, 5).map((visit) => (
                <Card key={visit.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {visit.menu_photo_url && (
                        <img
                          src={visit.menu_photo_url || "/placeholder.svg"}
                          alt="Menu"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{visit.restaurant_name}</h3>
                        {visit.location && (
                          <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{visit.location}</span>
                          </div>
                        )}
                        <p className="text-sm text-gray-600 mb-2">{new Date(visit.visit_date).toLocaleDateString()}</p>
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
                      {visit.overall_rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                          <span className="text-sm font-medium">{visit.overall_rating}</span>
                        </div>
                      )}
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
            <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Culinary Journey</h3>
            <p className="text-gray-600 mb-6">
              Capture menus, track dishes, and discover amazing recipes to recreate at home
            </p>
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
