"use client"

import { useState } from "react"
import { ArrowLeft, Check, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DishSelectionProps {
  dishes: any[]
  onDishesSelected: (selectedDishes: any[]) => void
  onBack: () => void
}

export function DishSelection({ dishes, onDishesSelected, onBack }: DishSelectionProps) {
  const [selectedDishes, setSelectedDishes] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")

  const filteredDishes = dishes.filter(
    (dish) =>
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleDishSelection = (dishId: string) => {
    const newSelected = new Set(selectedDishes)
    if (newSelected.has(dishId)) {
      newSelected.delete(dishId)
    } else {
      newSelected.add(dishId)
    }
    setSelectedDishes(newSelected)
  }

  const handleContinue = () => {
    const selected = dishes.filter((dish) => selectedDishes.has(dish.id))
    onDishesSelected(selected)
  }

  const groupedDishes = filteredDishes.reduce(
    (acc, dish) => {
      const category = dish.category || "Other"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(dish)
      return acc
    },
    {} as Record<string, any[]>,
  )

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="flex flex-col h-full">
        <div className="bg-white border-b">
          <div className="flex items-center justify-between p-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <h1 className="font-semibold">Select Your Dishes</h1>
              <p className="text-sm text-gray-600">
                {selectedDishes.size} of {dishes.length} selected
              </p>
            </div>
            <Button
              onClick={handleContinue}
              disabled={selectedDishes.size === 0}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Check className="h-4 w-4 mr-1" />
              Next
            </Button>
          </div>

          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {Object.entries(groupedDishes).map(([category, categoryDishes]) => (
              <div key={category}>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 sticky top-0 bg-white py-2">{category}</h2>
                <div className="space-y-3">
                  {categoryDishes.map((dish) => (
                    <Card
                      key={dish.id}
                      className={`cursor-pointer transition-all ${
                        selectedDishes.has(dish.id) ? "ring-2 ring-orange-500 bg-orange-50" : "hover:shadow-md"
                      }`}
                      onClick={() => toggleDishSelection(dish.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 truncate pr-2">{dish.name}</h3>
                              {dish.price && (
                                <Badge variant="outline" className="shrink-0">
                                  {dish.price}
                                </Badge>
                              )}
                            </div>
                            {dish.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">{dish.description}</p>
                            )}
                          </div>
                          <div className="ml-3 shrink-0">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                selectedDishes.has(dish.id) ? "bg-orange-500 border-orange-500" : "border-gray-300"
                              }`}
                            >
                              {selectedDishes.has(dish.id) && <Check className="h-4 w-4 text-white" />}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedDishes.size > 0 && (
          <div className="bg-white border-t p-4">
            <Button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold h-12"
            >
              Continue with {selectedDishes.size} dish{selectedDishes.size !== 1 ? "es" : ""}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
