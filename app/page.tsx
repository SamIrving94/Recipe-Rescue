"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import Dashboard from "@/components/dashboard"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const { user, loading } = useAuth()
  const { toast } = useToast()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your culinary journey...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login via middleware
  }

  // Map Supabase user to expected interface
  const dashboardUser = {
    id: user.id,
    email: user.email || '',
    display_name: user.user_metadata?.display_name,
    avatar_url: user.user_metadata?.avatar_url,
  }

  return <Dashboard user={dashboardUser} />
}
