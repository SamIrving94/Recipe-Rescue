export interface Dish {
  id: string
  name: string
  description?: string
  price?: string
  category?: string
  rating: number
  notes: string
  selected?: boolean
}

export interface RestaurantVisit {
  id: string
  restaurantName: string
  location?: string
  date: string
  dishes: Dish[]
  menuPhoto?: string | null
}
