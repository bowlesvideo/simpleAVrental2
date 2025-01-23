export interface User {
  id: string
  email: string
  name: string | null
}

export interface Package {
  id: string
  name: string
  price: number
}

export interface Rental {
  id: string
  user_id: string
  package_id: string
  total_amount: number
  status: string
  created_at: string
  package_name?: string
  package_price?: number
} 