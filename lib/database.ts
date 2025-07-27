import { createClient } from "@/lib/supabase/client"
import type { RestaurantVisit, Dish } from "@/types"

export class DatabaseService {
  private supabase = createClient()

  // Restaurant Visits
  async getVisits(userId: string): Promise<RestaurantVisit[]> {
    try {
      const { data, error } = await this.supabase
        .from("restaurant_visits")
        .select(`
          *,
          dishes (*)
        `)
        .eq("user_id", userId)
        .order("visit_date", { ascending: false })

      if (error) throw error

      return data.map((visit) => ({
        id: visit.id,
        restaurantName: visit.restaurant_name,
        location: visit.location,
        date: visit.visit_date,
        menuPhoto: visit.menu_photo_url,
        notes: visit.notes,
        overallRating: visit.overall_rating,
        dishes: visit.dishes.map((dish: any) => ({
          id: dish.id,
          name: dish.name,
          description: dish.description,
          price: dish.price,
          category: dish.category,
          rating: dish.rating || 0,
          notes: dish.notes,
          wantToRecreate: dish.want_to_recreate,
        })),
      }))
    } catch (error) {
      console.error("Error fetching visits:", error)
      throw error
    }
  }

  async createVisit(visitData: {
    userId: string
    restaurantName: string
    location?: string
    visitDate: string
    menuPhotoUrl?: string
    notes?: string
    overallRating?: number
  }): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from("restaurant_visits")
        .insert({
          user_id: visitData.userId,
          restaurant_name: visitData.restaurantName,
          location: visitData.location,
          visit_date: visitData.visitDate,
          menu_photo_url: visitData.menuPhotoUrl,
          notes: visitData.notes,
          overall_rating: visitData.overallRating,
        })
        .select()
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      console.error("Error creating visit:", error)
      throw error
    }
  }

  async updateVisit(visitId: string, updates: Partial<RestaurantVisit>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("restaurant_visits")
        .update({
          restaurant_name: updates.restaurantName,
          location: updates.location,
          visit_date: updates.date,
          menu_photo_url: updates.menuPhoto,
          notes: updates.notes,
          overall_rating: updates.overallRating,
          updated_at: new Date().toISOString(),
        })
        .eq("id", visitId)

      if (error) throw error
    } catch (error) {
      console.error("Error updating visit:", error)
      throw error
    }
  }

  async deleteVisit(visitId: string): Promise<void> {
    try {
      // Delete related dishes first
      await this.supabase.from("dishes").delete().eq("visit_id", visitId)
      
      // Delete the visit
      const { error } = await this.supabase
        .from("restaurant_visits")
        .delete()
        .eq("id", visitId)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting visit:", error)
      throw error
    }
  }

  // Dishes
  async createDishes(dishes: Array<{
    visitId: string
    name: string
    description?: string
    price?: string
    category?: string
    ordered: boolean
    rating?: number
    notes?: string
    wantToRecreate?: boolean
  }>): Promise<void> {
    try {
      const dishInserts = dishes.map((dish) => ({
        visit_id: dish.visitId,
        name: dish.name,
        description: dish.description,
        price: dish.price,
        category: dish.category,
        ordered: dish.ordered,
        rating: dish.rating,
        notes: dish.notes,
        want_to_recreate: dish.wantToRecreate || false,
      }))

      const { error } = await this.supabase.from("dishes").insert(dishInserts)
      if (error) throw error
    } catch (error) {
      console.error("Error creating dishes:", error)
      throw error
    }
  }

  async updateDish(dishId: string, updates: Partial<Dish>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("dishes")
        .update({
          name: updates.name,
          description: updates.description,
          price: updates.price,
          category: updates.category,
          rating: updates.rating,
          notes: updates.notes,
          want_to_recreate: updates.wantToRecreate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", dishId)

      if (error) throw error
    } catch (error) {
      console.error("Error updating dish:", error)
      throw error
    }
  }

  async deleteDish(dishId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("dishes")
        .delete()
        .eq("id", dishId)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting dish:", error)
      throw error
    }
  }

  // Search functionality
  async searchVisits(userId: string, query: string): Promise<RestaurantVisit[]> {
    try {
      const { data, error } = await this.supabase
        .from("restaurant_visits")
        .select(`
          *,
          dishes (*)
        `)
        .eq("user_id", userId)
        .or(`restaurant_name.ilike.%${query}%,location.ilike.%${query}%`)
        .order("visit_date", { ascending: false })

      if (error) throw error

      return data.map((visit) => ({
        id: visit.id,
        restaurantName: visit.restaurant_name,
        location: visit.location,
        date: visit.visit_date,
        menuPhoto: visit.menu_photo_url,
        notes: visit.notes,
        overallRating: visit.overall_rating,
        dishes: visit.dishes.map((dish: any) => ({
          id: dish.id,
          name: dish.name,
          description: dish.description,
          price: dish.price,
          category: dish.category,
          rating: dish.rating || 0,
          notes: dish.notes,
          wantToRecreate: dish.want_to_recreate,
        })),
      }))
    } catch (error) {
      console.error("Error searching visits:", error)
      throw error
    }
  }

  // Statistics
  async getStats(userId: string): Promise<{
    totalVisits: number
    totalDishes: number
    averageRating: number
    favoriteRestaurant: string | null
  }> {
    try {
      const visits = await this.getVisits(userId)
      
      const totalVisits = visits.length
      const totalDishes = visits.reduce((sum, visit) => sum + visit.dishes.length, 0)
      
      const allRatings = visits.flatMap(visit => 
        visit.dishes.map(dish => dish.rating)
      ).filter(rating => rating > 0)
      
      const averageRating = allRatings.length > 0 
        ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length 
        : 0

      // Find favorite restaurant (most visited)
      const restaurantCounts = visits.reduce((acc, visit) => {
        acc[visit.restaurantName] = (acc[visit.restaurantName] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const favoriteRestaurant = Object.entries(restaurantCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || null

      return {
        totalVisits,
        totalDishes,
        averageRating,
        favoriteRestaurant,
      }
    } catch (error) {
      console.error("Error getting stats:", error)
      throw error
    }
  }
}

export const db = new DatabaseService() 