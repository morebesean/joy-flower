// Database types for Supabase tables

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  image_url: string | null
  stock_quantity: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  status: OrderStatus
  total_amount: number

  // Buyer info
  buyer_name: string
  buyer_phone: string
  buyer_email: string

  // Recipient info
  recipient_name: string
  recipient_phone: string
  recipient_address: string

  // Delivery info
  delivery_type: 'pickup' | 'delivery'
  delivery_date: string | null
  delivery_time: string | null
  message_card: string | null

  // Payment info
  payment_method: string | null
  payment_status: PaymentStatus
  stripe_payment_id: string | null
  stripe_session_id: string | null

  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  created_at: string
}

export interface StockHistory {
  id: string
  product_id: string
  type: 'in' | 'out'
  quantity: number
  note: string | null
  created_at: string
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'delivering'
  | 'completed'
  | 'cancelled'

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
