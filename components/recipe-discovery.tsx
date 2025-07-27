"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, Search, Clock, Users, ChefHat, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Recipe {
  id: string
  title: string
  image_url?: string
  source_url?: string
  source_type: string
  cook_time?: string
  servings?: number
  difficulty?: string
  cuisine_type?: string
  ingredients?: string[]
  instructions?: string[]
  saved?: boolean
}

interface RecipeDiscoveryProps {
  dishName: string
  onBack: () => void
  onRecipeSaved?: (recipe: Recipe) => void
}

export default function RecipeDiscovery({ dishName, onBack, onRecipeSaved }: RecipeDiscoveryProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(dishName)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [savedRecipes, setSavedRecipes] = useState<Set<string>>(new Set())

  useEffect(() => {
    searchRecipes(dishName)
  }, [dishName])

  const searchRecipes = async (query: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/generate-recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dishName: query }),
      })

      if (response.ok) {
        const data = await response.json()
        setRecipes(data.recipes || [])
      }
    } catch (error) {
      console.error("Error fetching recipes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      searchRecipes(searchQuery.trim())
    }
  }

  const toggleSaveRecipe = async (recipe: Recipe) => {
    const newSaved = new Set(savedRecipes)
    if (newSaved.has(recipe.id)) {
      newSaved.delete(recipe.id)
    } else {
      newSaved.add(recipe.id)
      onRecipeSaved?.(recipe)
    }
    setSavedRecipes(newSaved)
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (selectedRecipe) {
    return (
      <div className="fixed inset-0 bg-white z-50">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-white border-b">
            <div className="flex items-center justify-between p-4">
              <Button variant="ghost" size="sm" onClick={() => setSelectedRecipe(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="font-semibold truncate">{selectedRecipe.title}</h1>
              <Button variant="ghost" size="sm" onClick={() => toggleSaveRecipe(selectedRecipe)}>
                {savedRecipes.has(selectedRecipe.id) ? (
                  <BookmarkCheck className="h-5 w-5 text-orange-500" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Recipe details */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Recipe image */}
              {selectedRecipe.image_url && (
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={selectedRecipe.image_url || "/placeholder.svg"}
                    alt={selectedRecipe.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Recipe meta */}
              <div className="flex flex-wrap gap-2">
                {selectedRecipe.cook_time && (
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{selectedRecipe.cook_time}</span>
                  </Badge>
                )}
                {selectedRecipe.servings && (
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{selectedRecipe.servings} servings</span>
                  </Badge>
                )}
                {selectedRecipe.difficulty && (
                  <Badge className={getDifficultyColor(selectedRecipe.difficulty)}>{selectedRecipe.difficulty}</Badge>
                )}
                {selectedRecipe.cuisine_type && <Badge variant="secondary">{selectedRecipe.cuisine_type}</Badge>}
              </div>

              {/* Ingredients */}
              {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ingredients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedRecipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                          <span className="text-sm">{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Instructions */}
              {selectedRecipe.instructions && selectedRecipe.instructions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4">
                      {selectedRecipe.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium shrink-0">
                            {index + 1}
                          </div>
                          <span className="text-sm leading-relaxed">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}

              {/* Source */}
              {selectedRecipe.source_url && (
                <Card>
                  <CardContent className="p-4">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => window.open(selectedRecipe.source_url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Original Recipe
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
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
            <h1 className="font-semibold">Find Recipes</h1>
            <div className="w-10" />
          </div>

          {/* Search */}
          <div className="px-4 pb-4">
            <form onSubmit={handleSearch} className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search for recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={loading}>
                Search
              </Button>
            </form>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="all" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
              <TabsTrigger value="all">All Recipes</TabsTrigger>
              <TabsTrigger value="easy">Easy</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-1 overflow-y-auto mt-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600">Finding recipes for "{searchQuery}"...</p>
                  </div>
                </div>
              ) : recipes.length > 0 ? (
                <div className="p-4 space-y-4">
                  {recipes.map((recipe) => (
                    <Card key={recipe.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          {recipe.image_url && (
                            <img
                              src={recipe.image_url || "/placeholder.svg"}
                              alt={recipe.title}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium text-gray-900 line-clamp-2">{recipe.title}</h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleSaveRecipe(recipe)
                                }}
                                className="ml-2 shrink-0"
                              >
                                {savedRecipes.has(recipe.id) ? (
                                  <BookmarkCheck className="h-4 w-4 text-orange-500" />
                                ) : (
                                  <Bookmark className="h-4 w-4" />
                                )}
                              </Button>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                              {recipe.cook_time && (
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {recipe.cook_time}
                                </Badge>
                              )}
                              {recipe.difficulty && (
                                <Badge className={`text-xs ${getDifficultyColor(recipe.difficulty)}`}>
                                  {recipe.difficulty}
                                </Badge>
                              )}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRecipe(recipe)}
                              className="w-full"
                            >
                              View Recipe
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full p-6">
                  <div className="text-center">
                    <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No recipes found</h3>
                    <p className="text-gray-600">Try searching for a different dish or ingredient</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="easy" className="flex-1 overflow-y-auto mt-4">
              <div className="p-4 space-y-4">
                {recipes
                  .filter((recipe) => recipe.difficulty?.toLowerCase() === "easy")
                  .map((recipe) => (
                    <Card key={recipe.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          {recipe.image_url && (
                            <img
                              src={recipe.image_url || "/placeholder.svg"}
                              alt={recipe.title}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                          )}

                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{recipe.title}</h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRecipe(recipe)}
                              className="w-full"
                            >
                              View Recipe
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="saved" className="flex-1 overflow-y-auto mt-4">
              <div className="p-4 space-y-4">
                {recipes
                  .filter((recipe) => savedRecipes.has(recipe.id))
                  .map((recipe) => (
                    <Card key={recipe.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          {recipe.image_url && (
                            <img
                              src={recipe.image_url || "/placeholder.svg"}
                              alt={recipe.title}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                          )}

                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{recipe.title}</h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRecipe(recipe)}
                              className="w-full"
                            >
                              View Recipe
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {savedRecipes.size === 0 && (
                  <div className="text-center py-8">
                    <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No saved recipes yet</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
