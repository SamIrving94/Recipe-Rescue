"use client"

import { ArrowLeft, Star, MapPin, Calendar, ChefHat, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { RestaurantVisit } from "@/types"

interface VisitTimelineProps {
  visits: RestaurantVisit[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onBack: () => void
}

export default function VisitTimeline({ visits, searchQuery, onSearchChange, onBack }: VisitTimelineProps) {
  const shareVisit = async (visit: RestaurantVisit) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My visit to ${visit.restaurantName}`,
          text: `Just tried ${visit.dishes.length} dishes at ${visit.restaurantName}! Average rating: ${(visit.dishes.reduce((acc, dish) => acc + dish.rating, 0) / visit.dishes.length).toFixed(1)}/5`,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Share cancelled or failed")
      }
    }
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
            <div className="text-center">
              <h1 className="font-semibold">Your Food Journey</h1>
              <p className="text-sm text-gray-600">{visits.length} visits</p>
            </div>
            <div className="w-10"></div>
          </div>

          {/* Search */}
          <div className="px-4 pb-4">
            <Input
              placeholder="Search restaurants or dishes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto">
          {visits.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <ChefHat className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No visits yet</h3>
              <p className="text-gray-600">Start tracking your restaurant experiences!</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {visits.map((visit) => {
                const averageRating = visit.dishes.reduce((acc, dish) => acc + dish.rating, 0) / visit.dishes.length

                return (
                  <Card key={visit.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      {/* Visit Header */}
                      <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{visit.restaurantName}</h3>
                            {visit.location && (
                              <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{visit.location}</span>
                              </div>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => shareVisit(visit)} className="shrink-0 ml-2">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(visit.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                            <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Dishes */}
                      <div className="p-4 space-y-3">
                        {visit.dishes.map((dish, index) => (
                          <div key={index} className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-gray-900 truncate">{dish.name}</h4>
                                {dish.price && (
                                  <Badge variant="outline" className="text-xs shrink-0">
                                    {dish.price}
                                  </Badge>
                                )}
                              </div>
                              {dish.notes && <p className="text-sm text-gray-600 line-clamp-2">{dish.notes}</p>}
                            </div>
                            <div className="flex items-center space-x-1 ml-3 shrink-0">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < dish.rating ? "fill-orange-400 text-orange-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
