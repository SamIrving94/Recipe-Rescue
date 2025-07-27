"use client"

import { useState } from "react"
import { User, Settings, LogOut, History, Star, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ProfileMenuProps {
  user: {
    id: string
    email: string
    display_name?: string
    avatar_url?: string
  }
  stats: {
    totalVisits: number
    totalDishes: number
    averageRating: number
  }
}

export default function ProfileMenu({ user, stats }: ProfileMenuProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const displayName = user.display_name || user.email.split("@")[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar_url || ""} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-400 text-white">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar_url || ""} alt={displayName} />
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-400 text-white">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <History className="h-3 w-3 text-orange-500" />
                  <span className="text-sm font-semibold">{stats.totalVisits}</span>
                </div>
                <p className="text-xs text-gray-500">Visits</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Trophy className="h-3 w-3 text-orange-500" />
                  <span className="text-sm font-semibold">{stats.totalDishes}</span>
                </div>
                <p className="text-xs text-gray-500">Dishes</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Star className="h-3 w-3 text-orange-500" />
                  <span className="text-sm font-semibold">{stats.averageRating.toFixed(1)}</span>
                </div>
                <p className="text-xs text-gray-500">Avg Rating</p>
              </div>
            </div>

            {/* Achievement Badge */}
            {stats.totalVisits >= 10 && (
              <div className="flex justify-center">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  🍽️ Foodie Explorer
                </Badge>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Preferences</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={handleSignOut}
          disabled={isLoading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? "Signing out..." : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
