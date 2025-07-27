"use client"

import { useState } from "react"
import { ArrowLeft, Search, Star, MapPin, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { RestaurantVisit } from "@/types"

interface VisitTimelineProps {
  visits: RestaurantVisit[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onBack: () => void
}

export default function VisitTimeline({ visits, searchQuery, onSearchChange, onBack }: VisitTimelineProps) {
  const [sortBy, setSortBy] = useState<"date" | "rating" | "name">("date")
  const [filterBy, setFilterBy] = useState<"all" | "favorites" | "recent">("all")

  const sortedAndFilteredVisits = visits
    .filter((visit) => {
      if (filterBy === "favorites") {
        return visit.dishes.some((dish) => dish.rating >= 4)
      }
      if (filterBy === "recent") {
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        return new Date(visit.date) >= oneWeekAgo
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "rating":
          const avgRatingA = a.dishes.reduce((sum, dish) => sum + dish.rating, 0) / a.dishes.length
          const avgRatingB = b.dishes.reduce((sum, dish) => sum + dish.rating, 0) / b.dishes.length
          return avgRatingB - avgRatingA
        case "name":
          return a.restaurantName.localeCompare(b.restaurantName)
        default:
          return 0
      }
    })

  const groupedVisits = sortedAndFilteredVisits.reduce(
    (groups, visit) => {
      const date = new Date(visit.date)
      const monthYear = date.toLocaleDateString("en-US", { month: "long", year: "numeric" })

      if (!groups[monthYear]) {
        groups[monthYear] = []
      }
      groups[monthYear].push(visit)
      return groups
    },
    {} as Record<string, RestaurantVisit[]>,
  )

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="flex items-center justify-between p-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold">Visit Timeline</h1>
            <div className="w-10" />
          </div>

          {/* Search and filters */}
          <div className="px-4 pb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search restaurants or dishes..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex space-x-2">
              <Select value={sortBy} onValueChange={(value: "date" | "rating" | "name") => setSortBy(value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="name">Restaurant</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBy} onValueChange={(value: "all" | "favorites" | "recent") => setFilterBy(value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All visits</SelectItem>
                  <SelectItem value="favorites">Favorites</SelectItem>
                  <SelectItem value="recent">Recent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Timeline content */}
        <div className="flex-1 overflow-y-auto">
          {Object.keys(groupedVisits).length > 0 ? (
            <div className="p-4">
              {Object.entries(groupedVisits).map(([monthYear, monthVisits]) => (
                <div key={monthYear} className="mb-8">
                  <div className="sticky top-0 bg-white py-2 mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-orange-500" />
                      {monthYear}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {monthVisits.map((visit) => {
                      const averageRating =
                        visit.dishes.reduce((sum, dish) => sum + dish.rating, 0) / visit.dishes.length

                      return (
                        <Card key={visit.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                              {visit.menuPhoto && (
                                <img
                                  src={visit.menuPhoto || "/placeholder.svg"}
                                  alt="Menu"
                                  className="w-20 h-20 rounded-lg object-cover"
                                />
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-semibold text-gray-900 truncate">{visit.restaurantName}</h3>
                                    {visit.location && (
                                      <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                                        <MapPin className="h-3 w-3" />
                                        <span className="truncate">{visit.location}</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-1 ml-2">
                                    <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                                    <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
                                  </div>
                                </div>

                                <p className="text-sm text-gray-600 mb-3">
                                  {new Date(visit.date).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </p>

                                <div className="space-y-2">
                                  {visit.dishes.slice(0, 3).map((dish, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                      <span className="text-sm text-gray-700 truncate">{dish.name}</span>
                                      <div className="flex items-center space-x-1 ml-2">
                                        <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                                        <span className="text-xs">{dish.rating}</span>
                                      </div>
                                    </div>
                                  ))}

                                  {visit.dishes.length > 3 && (
                                    <p className="text-xs text-gray-500">+{visit.dishes.length - 3} more dishes</p>
                                  )}
                                </div>

                                {visit.notes && <p className="text-sm text-gray-600 mt-2 italic">"{visit.notes}"</p>}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No visits found</h3>
                <p className="text-gray-600">
                  {searchQuery ? "Try adjusting your search or filters" : "Start tracking your restaurant visits!"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
