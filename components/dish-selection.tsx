"use client"

import { useState, useMemo } from "react"
import { ArrowLeft, Search, Filter, Check, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"

interface Dish {
  id: string
  name: string
  description?: string
  price?: string
  category: string
  selected?: boolean
}

interface DishSelectionProps {
  dishes: Dish[]
  onDishesSelected: (selectedDishes: Dish[]) => void
  onBack: () => void
}

export default function DishSelection({ dishes, onDishesSelected, onBack }: DishSelectionProps) {
  const [selectedDishes, setSelectedDishes] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(dishes.map((dish) => dish.category))]
    return ["all", ...cats.sort()]
  }, [dishes])

  // Filter dishes based on search and category
  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const matchesSearch =
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || dish.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [dishes, searchQuery, selectedCategory])

  // Group dishes by category
  const groupedDishes = useMemo(() => {
    return filteredDishes.reduce(
      (groups, dish) => {
        const category = dish.category || "Other"
        if (!groups[category]) {
          groups[category] = []
        }
        groups[category].push(dish)
        return groups
      },
      {} as Record<string, Dish[]>,
    )
  }, [filteredDishes])

  const toggleDish = (dishId: string) => {
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

  const selectAll = () => {
    setSelectedDishes(new Set(filteredDishes.map((dish) => dish.id)))
  }

  const clearAll = () => {
    setSelectedDishes(new Set())
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
              <h1 className="font-semibold">Select Dishes</h1>
              <p className="text-sm text-gray-600">
                {selectedDishes.size} of {dishes.length} selected
              </p>
            </div>
            <div className="w-10" />
          </div>

          {/* Search and filters */}
          <div className="px-4 pb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-auto p-1">
                {categories.slice(0, 4).map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="text-xs px-2 py-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                  >
                    {category === "all" ? "All" : category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Quick actions */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  <Plus className="h-3 w-3 mr-1" />
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearAll}>
                  <Minus className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              </div>
              <Badge variant="secondary">{filteredDishes.length} dishes</Badge>
            </div>
          </div>
        </div>

        {/* Dishes list */}
        <div className="flex-1 overflow-y-auto">
          {Object.keys(groupedDishes).length > 0 ? (
            <div className="p-4">
              {Object.entries(groupedDishes).map(([category, categoryDishes]) => (
                <div key={category} className="mb-6">
                  <div className="sticky top-0 bg-white py-2 mb-3">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      {category}
                      <Badge variant="outline" className="ml-2">
                        {categoryDishes.length}
                      </Badge>
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {categoryDishes.map((dish) => {
                      const isSelected = selectedDishes.has(dish.id)

                      return (
                        <Card
                          key={dish.id}
                          className={`cursor-pointer transition-all ${
                            isSelected ? "ring-2 ring-orange-500 bg-orange-50" : "hover:shadow-md"
                          }`}
                          onClick={() => toggleDish(dish.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <Checkbox checked={isSelected} onChange={() => toggleDish(dish.id)} className="mt-1" />

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-medium text-gray-900 line-clamp-2">{dish.name}</h3>
                                  {dish.price && (
                                    <Badge variant="outline" className="ml-2 shrink-0">
                                      {dish.price}
                                    </Badge>
                                  )}
                                </div>

                                {dish.description && (
                                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{dish.description}</p>
                                )}

                                <Badge variant="secondary" className="text-xs">
                                  {dish.category}
                                </Badge>
                              </div>

                              {isSelected && (
                                <div className="shrink-0">
                                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                    <Check className="h-4 w-4 text-white" />
                                  </div>
                                </div>
                              )}
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
                <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No dishes found</h3>
                <p className="text-gray-600">
                  {searchQuery ? "Try adjusting your search terms" : "No dishes available"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom action */}
        <div className="bg-white border-t p-4">
          <Button
            onClick={handleContinue}
            disabled={selectedDishes.size === 0}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          >
            Continue with {selectedDishes.size} dish{selectedDishes.size !== 1 ? "es" : ""}
          </Button>
        </div>
      </div>
    </div>
  )
}
