export interface Dish {
  id: string
  name: string
  description?: string
  price?: string
  category?: string
  rating: number
  notes?: string
  wantToRecreate?: boolean
}

export interface RestaurantVisit {
  id: string
  restaurantName: string
  location?: string
  date: string
  menuPhoto?: string
  dishes: Dish[]
  notes?: string
  overallRating?: number
}

export interface Recipe {
  id: string
  title: string
  ingredients: string[]
  instructions: string[]
  cookTime?: string
  servings?: number
  difficulty?: string
  cuisineType?: string
  sourceUrl?: string
  imageUrl?: string
  savedAt: string
}

export interface UserProfile {
  id: string
  email: string
  displayName?: string
  avatarUrl?: string
  createdAt: string
}

// Supabase Database Types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      restaurant_visits: {
        Row: {
          id: string
          user_id: string
          restaurant_name: string
          location: string | null
          visit_date: string
          menu_photo_url: string | null
          overall_rating: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          restaurant_name: string
          location?: string | null
          visit_date: string
          menu_photo_url?: string | null
          overall_rating?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          restaurant_name?: string
          location?: string | null
          visit_date?: string
          menu_photo_url?: string | null
          overall_rating?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      dishes: {
        Row: {
          id: string
          visit_id: string
          name: string
          description: string | null
          price: string | null
          category: string | null
          ordered: boolean
          rating: number | null
          notes: string | null
          want_to_recreate: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          visit_id: string
          name: string
          description?: string | null
          price?: string | null
          category?: string | null
          ordered?: boolean
          rating?: number | null
          notes?: string | null
          want_to_recreate?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          visit_id?: string
          name?: string
          description?: string | null
          price?: string | null
          category?: string | null
          ordered?: boolean
          rating?: number | null
          notes?: string | null
          want_to_recreate?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          user_id: string
          title: string
          source_url: string | null
          source_type: string
          image_url: string | null
          ingredients: string[]
          instructions: string[]
          cook_time: string | null
          servings: number | null
          difficulty: string | null
          cuisine_type: string | null
          linked_dish_id: string | null
          saved_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          source_url?: string | null
          source_type: string
          image_url?: string | null
          ingredients: string[]
          instructions: string[]
          cook_time?: string | null
          servings?: number | null
          difficulty?: string | null
          cuisine_type?: string | null
          linked_dish_id?: string | null
          saved_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          source_url?: string | null
          source_type?: string
          image_url?: string | null
          ingredients?: string[]
          instructions?: string[]
          cook_time?: string | null
          servings?: number | null
          difficulty?: string | null
          cuisine_type?: string | null
          linked_dish_id?: string | null
          saved_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
