"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface MenuAnalysisProps {
  photo: string
  onDishesExtracted: (dishes: any[]) => void
  onBack: () => void
}

export function MenuAnalysis({ photo, onDishesExtracted, onBack }: MenuAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    analyzeMenu()
  }, [])

  const analyzeMenu = async () => {
    try {
      setIsAnalyzing(true)
      setError(null)
      setProgress(0)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch("/api/analyze-menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: photo }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        throw new Error("Failed to analyze menu")
      }

      const data = await response.json()

      // Transform the response into dish objects
      const dishes = data.dishes.map((dish: any, index: number) => ({
        id: `dish-${index}`,
        name: dish.name,
        description: dish.description,
        price: dish.price,
        category: dish.category,
        rating: 0,
        notes: "",
        selected: false,
      }))

      setTimeout(() => {
        onDishesExtracted(dishes)
      }, 500)
    } catch (error) {
      console.error("Error analyzing menu:", error)
      setError("Failed to analyze menu. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-white z-50">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold">Menu Analysis</h1>
            <div className="w-10"></div>
          </div>

          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="w-full max-w-sm">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Failed</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <div className="space-y-2">
                  <Button onClick={analyzeMenu} className="w-full">
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={onBack} className="w-full bg-transparent">
                    Take New Photo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">Analyzing Menu</h1>
          <div className="w-10"></div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-sm mb-8">
            <img
              src={photo || "/placeholder.svg"}
              alt="Menu being analyzed"
              className="w-full h-64 object-cover rounded-lg shadow-lg"
            />
          </div>

          <div className="text-center w-full max-w-sm">
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-orange-200 rounded-full animate-spin mx-auto"></div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI is reading your menu...</h3>
            <p className="text-gray-600 mb-6">Extracting dishes, prices, and descriptions</p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Progress Steps */}
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${progress > 0 ? "bg-green-500" : "bg-gray-300"}`}></div>
                <span>Image processed</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${progress > 50 ? "bg-green-500" : progress > 0 ? "bg-orange-500 animate-pulse" : "bg-gray-300"}`}
                ></div>
                <span>Extracting menu items...</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${progress === 100 ? "bg-green-500" : "bg-gray-300"}`}></div>
                <span>Organizing results</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
