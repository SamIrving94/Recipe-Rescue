"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Search, Clock, Users, ChefHat, ExternalLink, BookmarkCheck, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers/auth-provider"
import type { Database } from "@/lib/supabase/types"

type Recipe = Database["public"]["Tables"]["recipes"]["Row"]
type Dish = Database["public"]["Tables"]["dishes"]["Row"]

interface RecipeDiscoveryProps {
  onBack: () => void
}

export function RecipeDiscovery({ onBack }: RecipeDiscoveryProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [dishesToRecreate, setDishesToRecreate] = useState<Dish[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("saved")
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      // Load saved recipes
      const { data: recipesData } = await supabase.from("recipes").select("*").order("saved_at", { ascending: false })

      if (recipesData) {
        setRecipes(recipesData)
      }

      // Load dishes marked for recreation
      const { data: dishesData } = await supabase
        .from("dishes")
        .select(`
          *,
          restaurant_visits!inner (
            restaurant_name,
            visit_date
          )
        `)
        .eq("want_to_recreate", true)
        .order("created_at", { ascending: false })

      if (dishesData) {
        setDishesToRecreate(dishesData as any)
      }
    } catch (error) {
      console.error("Error loading recipes:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleBookmark = async (recipe: Recipe) => {
    try {
      if (recipe.user_id === user?.id) {
        // Remove from saved recipes
        await supabase.from("recipes").delete().eq("id", recipe.id)
      } else {
        // Save recipe
        await supabase.from("recipes").insert({
          user_id: user!.id,
          title: recipe.title,
          source_url: recipe.source_url,
          source_type: "web",
          image_url: recipe.image_url,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          cook_time: recipe.cook_time,
          servings: recipe.servings,
          difficulty: recipe.difficulty,
          cuisine_type: recipe.cuisine_type,
        })
      }

      await loadData()
    } catch (error) {
      console.error("Error toggling bookmark:", error)
    }
  }

  const generateRecipeForDish = async (dish: Dish) => {
    try {
      const response = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dishName: dish.name,
          dishDescription: dish.description,
          restaurantName: (dish as any).restaurant_visits?.restaurant_name,
        }),
      })

      if (response.ok) {
        await loadData()
      }
    } catch (error) {
      console.error("Error generating recipe:", error)
    }
  }

  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.cuisine_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients?.some((ingredient) => ingredient.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const filteredDishes = dishesToRecreate.filter(
    (dish) =>
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recipes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="flex items-center justify-between p-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold">Recipe Discovery</h1>
            <div className="w-10"></div>
          </div>

          {/* Search */}
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search recipes or dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
              <TabsTrigger value="saved">Saved Recipes ({recipes.length})</TabsTrigger>
              <TabsTrigger value="recreate">To Recreate ({dishesToRecreate.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="saved" className="flex-1 overflow-y-auto mt-4">
              <div className="px-4 space-y-4">
                {filteredRecipes.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved recipes yet</h3>
                    <p className="text-gray-600">Start by marking dishes you want to recreate!</p>
                  </div>
                ) : (
                  filteredRecipes.map((recipe) => (
                    <Card key={recipe.id}>
                      <CardContent className="p-4">
                        <div className="flex space-x-4">
                          {recipe.image_url && (
                            <img
                              src={recipe.image_url || "/placeholder.svg"}
                              alt={recipe.title}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 truncate">{recipe.title}</h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleBookmark(recipe)}
                                className="shrink-0 ml-2"
                              >
                                <BookmarkCheck className="h-4 w-4 text-orange-500" />
                              </Button>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-2">
                              {recipe.difficulty && (
                                <Badge variant="outline" className="text-xs">
                                  {recipe.difficulty}
                                </Badge>
                              )}
                              {recipe.cuisine_type && (
                                <Badge variant="secondary" className="text-xs">
                                  {recipe.cuisine_type}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              {recipe.cook_time && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{recipe.cook_time}</span>
                                </div>
                              )}
                              {recipe.servings && (
                                <div className="flex items-center space-x-1">
                                  <Users className="h-3 w-3" />
                                  <span>{recipe.servings}</span>
                                </div>
                              )}
                            </div>

                            {recipe.source_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 bg-transparent"
                                onClick={() => window.open(recipe.source_url!, "_blank")}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View Recipe
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="recreate" className="flex-1 overflow-y-auto mt-4">
              <div className="px-4 space-y-4">
                {filteredDishes.length === 0 ? (
                  <div className="text-center py-12">
                    <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No dishes to recreate</h3>
                    <p className="text-gray-600">Mark dishes as "want to recreate" when rating your experiences!</p>
                  </div>
                ) : (
                  filteredDishes.map((dish) => (
                    <Card key={dish.id}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{dish.name}</h3>
                            <p className="text-sm text-gray-600">
                              From {(dish as any).restaurant_visits?.restaurant_name} •{" "}
                              {new Date((dish as any).restaurant_visits?.visit_date).toLocaleDateString()}
                            </p>
                            {dish.description && <p className="text-sm text-gray-600 mt-1">{dish.description}</p>}
                          </div>

                          <Button
                            onClick={() => generateRecipeForDish(dish)}
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                          >
                            <ChefHat className="h-4 w-4 mr-2" />
                            Generate AI Recipe
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
