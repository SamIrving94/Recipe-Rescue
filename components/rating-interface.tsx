"use client"

import { useState } from "react"
import { ArrowLeft, Star, ChefHat, MapPin, Calendar, Save, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface RatingInterfaceProps {
  dishes: any[]
  onVisitComplete: (visit: any) => void
  onBack: () => void
}

export function RatingInterface({ dishes, onVisitComplete, onBack }: RatingInterfaceProps) {
  const [restaurantName, setRestaurantName] = useState("")
  const [location, setLocation] = useState("")
  const [overallRating, setOverallRating] = useState(0)
  const [notes, setNotes] = useState("")
  const [dishRatings, setDishRatings] = useState<
    Record<string, { rating: number; notes: string; wantToRecreate: boolean }>
  >({})
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  const updateDishRating = (dishId: string, rating: number) => {
    setDishRatings((prev) => ({
      ...prev,
      [dishId]: { ...prev[dishId], rating },
    }))
  }

  const updateDishNotes = (dishId: string, notes: string) => {
    setDishRatings((prev) => ({
      ...prev,
      [dishId]: { ...prev[dishId], notes },
    }))
  }

  const updateWantToRecreate = (dishId: string, wantToRecreate: boolean) => {
    setDishRatings((prev) => ({
      ...prev,
      [dishId]: { ...prev[dishId], wantToRecreate },
    }))
  }

  const handleSave = async () => {
    if (!restaurantName.trim() || !user) return

    setIsLoading(true)

    try {
      // Create restaurant visit
      const { data: visit, error: visitError } = await supabase
        .from("restaurant_visits")
        .insert({
          user_id: user.id,
          restaurant_name: restaurantName.trim(),
          location: location.trim() || null,
          visit_date: new Date().toISOString().split("T")[0],
          overall_rating: overallRating || null,
          notes: notes.trim() || null,
        })
        .select()
        .single()

      if (visitError) throw visitError

      // Create dishes
      const dishesToInsert = dishes.map((dish) => ({
        visit_id: visit.id,
        name: dish.name,
        description: dish.description || null,
        price: dish.price || null,
        category: dish.category || null,
        ordered: true,
        rating: dishRatings[dish.id]?.rating || null,
        notes: dishRatings[dish.id]?.notes || null,
        want_to_recreate: dishRatings[dish.id]?.wantToRecreate || false,
      }))

      const { error: dishesError } = await supabase.from("dishes").insert(dishesToInsert)

      if (dishesError) throw dishesError

      // Generate AI recipes for dishes marked for recreation
      const dishesToRecreate = dishes.filter((dish) => dishRatings[dish.id]?.wantToRecreate)

      if (dishesToRecreate.length > 0) {
        // This would trigger recipe generation in the background
        fetch("/api/generate-recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitId: visit.id,
            dishes: dishesToRecreate,
            restaurantName: restaurantName.trim(),
          }),
        }).catch(console.error) // Fire and forget
      }

      toast({
        title: "Visit saved!",
        description: `Your experience at ${restaurantName} has been recorded.`,
      })

      onVisitComplete(visit)
    } catch (error) {
      console.error("Error saving visit:", error)
      toast({
        title: "Error saving visit",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const allRated = dishes.every((dish) => dishRatings[dish.id]?.rating > 0)
  const canSave = restaurantName.trim() && allRated && !isLoading

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="flex flex-col h-full">
        <div className="bg-white border-b">
          <div className="flex items-center justify-between p-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold">Rate Your Experience</h1>
            <Button onClick={handleSave} disabled={!canSave} size="sm" className="bg-orange-500 hover:bg-orange-600">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Restaurant Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ChefHat className="h-5 w-5 text-orange-500" />
                  <span>Restaurant Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="restaurant-name">Restaurant Name *</Label>
                  <Input
                    id="restaurant-name"
                    placeholder="Enter restaurant name"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="location"
                      placeholder="Enter location (optional)"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label>Overall Experience</Label>
                  <div className="flex space-x-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setOverallRating(star)} className="p-1">
                        <Star
                          className={`h-6 w-6 ${
                            star <= overallRating ? "fill-orange-400 text-orange-400" : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="visit-notes">Visit Notes</Label>
                  <Textarea
                    id="visit-notes"
                    placeholder="How was your overall experience?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Dish Ratings */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Rate Your Dishes</h2>
              {dishes.map((dish) => (
                <Card key={dish.id}>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{dish.name}</h3>
                          {dish.price && <Badge variant="outline">{dish.price}</Badge>}
                        </div>
                        {dish.description && <p className="text-sm text-gray-600 mb-3">{dish.description}</p>}
                      </div>

                      {/* Star Rating */}
                      <div>
                        <Label>Rating *</Label>
                        <div className="flex space-x-1 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => updateDishRating(dish.id, star)} className="p-1">
                              <Star
                                className={`h-6 w-6 ${
                                  star <= (dishRatings[dish.id]?.rating || 0)
                                    ? "fill-orange-400 text-orange-400"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <Label>Notes</Label>
                        <Textarea
                          placeholder="How was this dish? Any special notes..."
                          value={dishRatings[dish.id]?.notes || ""}
                          onChange={(e) => updateDishNotes(dish.id, e.target.value)}
                          rows={2}
                        />
                      </div>

                      {/* Want to Recreate */}
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`recreate-${dish.id}`}
                          checked={dishRatings[dish.id]?.wantToRecreate || false}
                          onCheckedChange={(checked) => updateWantToRecreate(dish.id, checked)}
                        />
                        <Label htmlFor={`recreate-${dish.id}`} className="flex items-center space-x-2 cursor-pointer">
                          <Sparkles className="h-4 w-4 text-orange-500" />
                          <span>I want to recreate this at home</span>
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border-t p-4">
          <Button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold h-12"
          >
            {!restaurantName.trim()
              ? "Enter restaurant name"
              : !allRated
                ? "Rate all dishes"
                : isLoading
                  ? "Saving experience..."
                  : "Save Experience"}
          </Button>
        </div>
      </div>
    </div>
  )
}
