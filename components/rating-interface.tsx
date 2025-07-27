"use client"

import { useState } from "react"
import { ArrowLeft, Star, Save, MapPin, Calendar, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface Dish {
  id: string
  name: string
  description?: string
  price?: string
  category: string
}

interface RatingData {
  dishId: string
  rating: number
  notes: string
  wantToRecreate: boolean
}

interface RatingInterfaceProps {
  dishes: Dish[]
  restaurantName: string
  location?: string
  onRatingsComplete: (ratings: RatingData[], visitNotes: string) => void
  onBack: () => void
}

export default function RatingInterface({
  dishes,
  restaurantName,
  location,
  onRatingsComplete,
  onBack,
}: RatingInterfaceProps) {
  const [currentDishIndex, setCurrentDishIndex] = useState(0)
  const [ratings, setRatings] = useState<Record<string, RatingData>>({})
  const [visitNotes, setVisitNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentDish = dishes[currentDishIndex]
  const currentRating = ratings[currentDish?.id] || {
    dishId: currentDish?.id || "",
    rating: 0,
    notes: "",
    wantToRecreate: false,
  }

  const updateRating = (dishId: string, updates: Partial<RatingData>) => {
    setRatings((prev) => ({
      ...prev,
      [dishId]: {
        ...prev[dishId],
        dishId,
        ...updates,
      },
    }))
  }

  const setStarRating = (rating: number) => {
    updateRating(currentDish.id, { rating })
  }

  const nextDish = () => {
    if (currentDishIndex < dishes.length - 1) {
      setCurrentDishIndex(currentDishIndex + 1)
    }
  }

  const previousDish = () => {
    if (currentDishIndex > 0) {
      setCurrentDishIndex(currentDishIndex - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const ratingsArray = Object.values(ratings).filter((rating) => rating.rating > 0)
      await onRatingsComplete(ratingsArray, visitNotes)
    } catch (error) {
      console.error("Error submitting ratings:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const completedRatings = Object.values(ratings).filter((r) => r.rating > 0).length
  const progress = (completedRatings / dishes.length) * 100

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="flex items-center justify-between p-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <h1 className="font-semibold">Rate Your Experience</h1>
              <p className="text-sm text-gray-600">
                {currentDishIndex + 1} of {dishes.length} dishes
              </p>
            </div>
            <div className="w-10" />
          </div>

          {/* Progress bar */}
          <div className="px-4 pb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1 text-center">
              {completedRatings} of {dishes.length} dishes rated
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Restaurant info */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-lg flex items-center justify-center">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900">{restaurantName}</h2>
                  {location && (
                    <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current dish rating */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="truncate">{currentDish.name}</span>
                <Badge variant="outline">{currentDish.category}</Badge>
              </CardTitle>
              {currentDish.description && <p className="text-sm text-gray-600">{currentDish.description}</p>}
              {currentDish.price && (
                <Badge variant="secondary" className="w-fit">
                  {currentDish.price}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Star rating */}
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-3">How was this dish?</p>
                <div className="flex justify-center space-x-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setStarRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= currentRating.rating
                            ? "fill-orange-400 text-orange-400"
                            : "text-gray-300 hover:text-orange-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {currentRating.rating > 0 && (
                  <p className="text-sm text-gray-600">
                    {currentRating.rating === 1 && "Poor"}
                    {currentRating.rating === 2 && "Fair"}
                    {currentRating.rating === 3 && "Good"}
                    {currentRating.rating === 4 && "Very Good"}
                    {currentRating.rating === 5 && "Excellent"}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notes (optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="What did you think? Any special ingredients or flavors?"
                  value={currentRating.notes}
                  onChange={(e) => updateRating(currentDish.id, { notes: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Want to recreate */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="recreate"
                  checked={currentRating.wantToRecreate}
                  onCheckedChange={(checked) => updateRating(currentDish.id, { wantToRecreate: checked })}
                />
                <Label htmlFor="recreate" className="text-sm">
                  I want to find recipes for this dish
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Visit notes (show on last dish) */}
          {currentDishIndex === dishes.length - 1 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Overall Visit Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="How was your overall experience at this restaurant?"
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation */}
        <div className="bg-white border-t p-4">
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={previousDish} disabled={currentDishIndex === 0}>
              Previous
            </Button>

            <div className="flex space-x-2">
              {dishes.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentDishIndex
                      ? "bg-orange-500"
                      : ratings[dishes[index].id]?.rating > 0
                        ? "bg-green-500"
                        : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {currentDishIndex === dishes.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={completedRatings === 0 || isSubmitting}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Visit"}
              </Button>
            ) : (
              <Button
                onClick={nextDish}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
