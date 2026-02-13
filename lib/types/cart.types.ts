// Cart related types

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image_url: string | null
}

export interface Cart {
  items: CartItem[]
  total: number
}

export interface OrderFormData {
  // Buyer info
  buyerName: string
  buyerPhone: string
  buyerEmail: string

  // Recipient info
  recipientName: string
  recipientPhone: string
  recipientAddress: string

  // Delivery info
  deliveryType: 'pickup' | 'delivery'
  deliveryDate?: string
  deliveryTime?: string
  messageCard?: string
}
