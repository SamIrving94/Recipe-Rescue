"use client"

import { useState, useEffect } from "react"
import CameraCapture from "@/components/camera-capture"
import MenuAnalysis from "@/components/menu-analysis"
import DishSelection from "@/components/dish-selection"
import RatingInterface from "@/components/rating-interface"
import VisitTimeline from "@/components/visit-timeline"
import Dashboard from "@/components/dashboard"
import type { RestaurantVisit, Dish } from "@/types"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [currentView, setCurrentView] = useState<"home" | "camera" | "analysis" | "selection" | "rating" | "timeline">(
    "home",
  )
  const [visits, setVisits] = useState<RestaurantVisit[]>([])
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null)
  const [extractedDishes, setExtractedDishes] = useState<Dish[]>([])
  const [selectedDishes, setSelectedDishes] = useState<Dish[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
    // Load visits from localStorage
    const savedVisits = localStorage.getItem("restaurant-visits")
    if (savedVisits) {
      setVisits(JSON.parse(savedVisits))
    }
  }, [user, loading, router])

  const saveVisits = (newVisits: RestaurantVisit[]) => {
    setVisits(newVisits)
    localStorage.setItem("restaurant-visits", JSON.stringify(newVisits))
  }

  const handlePhotoCapture = (photo: string) => {
    setCurrentPhoto(photo)
    setCurrentView("analysis")
  }

  const handleDishesExtracted = (dishes: Dish[]) => {
    setExtractedDishes(dishes)
    setCurrentView("selection")
  }

  const handleDishesSelected = (dishes: Dish[]) => {
    setSelectedDishes(dishes)
    setCurrentView("rating")
  }

  const handleVisitComplete = (visit: RestaurantVisit) => {
    const newVisits = [visit, ...visits]
    saveVisits(newVisits)
    setCurrentView("home")
    setCurrentPhoto(null)
    setExtractedDishes([])
    setSelectedDishes([])
  }

  const filteredVisits = visits.filter(
    (visit) =>
      visit.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.dishes.some((dish) => dish.name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const recentVisits = visits.slice(0, 3)
  const totalDishes = visits.reduce((acc, visit) => acc + visit.dishes.length, 0)
  const averageRating =
    visits.length > 0
      ? visits.reduce(
          (acc, visit) => acc + visit.dishes.reduce((dishAcc, dish) => dishAcc + dish.rating, 0) / visit.dishes.length,
          0,
        ) / visits.length
      : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  if (currentView === "camera") {
    return <CameraCapture onPhotoCapture={handlePhotoCapture} onBack={() => setCurrentView("home")} />
  }

  if (currentView === "analysis") {
    return (
      <MenuAnalysis
        photo={currentPhoto!}
        onDishesExtracted={handleDishesExtracted}
        onBack={() => setCurrentView("home")}
      />
    )
  }

  if (currentView === "selection") {
    return (
      <DishSelection
        dishes={extractedDishes}
        onDishesSelected={handleDishesSelected}
        onBack={() => setCurrentView("analysis")}
      />
    )
  }

  if (currentView === "rating") {
    return (
      <RatingInterface
        dishes={selectedDishes}
        onVisitComplete={handleVisitComplete}
        onBack={() => setCurrentView("selection")}
      />
    )
  }

  if (currentView === "timeline") {
    return (
      <VisitTimeline
        visits={filteredVisits}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBack={() => setCurrentView("home")}
      />
    )
  }

  return <Dashboard />
}
