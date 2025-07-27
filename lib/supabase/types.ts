export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
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
          overall_rating: number | null
          notes: string | null
          menu_photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          restaurant_name: string
          location?: string | null
          visit_date: string
          overall_rating?: number | null
          notes?: string | null
          menu_photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          restaurant_name?: string
          location?: string | null
          visit_date?: string
          overall_rating?: number | null
          notes?: string | null
          menu_photo_url?: string | null
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
          source_type: string | null
          image_url: string | null
          ingredients: string[] | null
          instructions: string[] | null
          cook_time: string | null
          servings: string | null
          difficulty: string | null
          cuisine_type: string | null
          linked_dish_id: string | null
          saved_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          source_url?: string | null
          source_type?: string | null
          image_url?: string | null
          ingredients?: string[] | null
          instructions?: string[] | null
          cook_time?: string | null
          servings?: string | null
          difficulty?: string | null
          cuisine_type?: string | null
          linked_dish_id?: string | null
          saved_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          source_url?: string | null
          source_type?: string | null
          image_url?: string | null
          ingredients?: string[] | null
          instructions?: string[] | null
          cook_time?: string | null
          servings?: string | null
          difficulty?: string | null
          cuisine_type?: string | null
          linked_dish_id?: string | null
          saved_at?: string
          updated_at?: string
        }
      }
    }
  }
}
