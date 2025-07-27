"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface MenuAnalysisProps {
  photo: string
  onDishesExtracted: (dishes: any[]) => void
  onBack: () => void
}

export default function MenuAnalysis({ photo, onDishesExtracted, onBack }: MenuAnalysisProps) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"analyzing" | "success" | "error">("analyzing")
  const [statusMessage, setStatusMessage] = useState("Initializing AI analysis...")
  const [extractedDishes, setExtractedDishes] = useState<any[]>([])

  useEffect(() => {
    analyzeMenu()
  }, [photo])

  const analyzeMenu = async () => {
    try {
      setStatus("analyzing")
      setProgress(10)
      setStatusMessage("Uploading menu photo...")

      // Simulate progress updates
      const progressSteps = [
        { progress: 25, message: "Processing image with AI..." },
        { progress: 50, message: "Extracting menu items..." },
        { progress: 75, message: "Analyzing prices and descriptions..." },
        { progress: 90, message: "Organizing dishes by category..." },
      ]

      for (const step of progressSteps) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setProgress(step.progress)
        setStatusMessage(step.message)
      }

      // Call the API
      const response = await fetch("/api/analyze-menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: photo }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze menu")
      }

      const data = await response.json()

      setProgress(100)
      setStatusMessage("Analysis complete!")
      setStatus("success")
      setExtractedDishes(data.dishes || [])

      // Auto-proceed after a short delay
      setTimeout(() => {
        onDishesExtracted(data.dishes || [])
      }, 1500)
    } catch (error) {
      console.error("Error analyzing menu:", error)
      setStatus("error")
      setStatusMessage("Failed to analyze menu. Please try again.")
    }
  }

  const handleRetry = () => {
    setProgress(0)
    analyzeMenu()
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
            <h1 className="font-semibold">Analyzing Menu</h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md text-center">
            {/* Menu photo preview */}
            <div className="mb-8">
              <img
                src={photo || "/placeholder.svg"}
                alt="Menu being analyzed"
                className="w-full h-48 object-cover rounded-lg shadow-lg"
              />
            </div>

            {/* Status icon */}
            <div className="mb-6">
              {status === "analyzing" && <Loader2 className="h-16 w-16 text-orange-500 animate-spin mx-auto" />}
              {status === "success" && <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />}
              {status === "error" && <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />}
            </div>

            {/* Progress bar */}
            {status === "analyzing" && (
              <div className="mb-6">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-600 mt-2">{progress}% complete</p>
              </div>
            )}

            {/* Status message */}
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {status === "analyzing" && "AI is analyzing your menu..."}
              {status === "success" && `Found ${extractedDishes.length} dishes!`}
              {status === "error" && "Analysis failed"}
            </h2>

            <p className="text-gray-600 mb-8">{statusMessage}</p>

            {/* Success details */}
            {status === "success" && extractedDishes.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-green-800">{extractedDishes.length}</div>
                    <div className="text-green-600">Dishes Found</div>
                  </div>
                  <div>
                    <div className="font-semibold text-green-800">
                      {new Set(extractedDishes.map((d) => d.category)).size}
                    </div>
                    <div className="text-green-600">Categories</div>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {status === "error" && (
              <div className="space-y-3">
                <Button onClick={handleRetry} className="w-full bg-orange-500 hover:bg-orange-600">
                  Try Again
                </Button>
                <Button onClick={onBack} variant="outline" className="w-full bg-transparent">
                  Take New Photo
                </Button>
              </div>
            )}

            {status === "success" && (
              <Button
                onClick={() => onDishesExtracted(extractedDishes)}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                Continue to Selection
              </Button>
            )}

            {/* Tips */}
            {status === "analyzing" && (
              <div className="mt-8 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">💡 Did you know?</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Our AI can detect prices, descriptions, and categories</li>
                  <li>• We organize dishes by type (appetizers, mains, desserts)</li>
                  <li>• You can search and filter dishes after analysis</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
