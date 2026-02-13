import { z } from 'zod'

export const orderFormSchema = z.object({
  // Buyer info
  buyerName: z.string().min(2, 'Name must be at least 2 characters'),
  buyerPhone: z.string().min(10, 'Please enter a valid phone number'),
  buyerEmail: z.string().email('Please enter a valid email'),

  // Recipient info
  recipientName: z.string().min(2, 'Name must be at least 2 characters'),
  recipientPhone: z.string().min(10, 'Please enter a valid phone number'),
  recipientAddress: z.string().min(10, 'Please enter a complete address'),

  // Delivery info
  deliveryType: z.enum(['pickup', 'delivery']),
  deliveryDate: z.string().optional(),
  deliveryTime: z.string().optional(),
  messageCard: z.string().max(200, 'Message is too long').optional(),
})

export const productFormSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  category: z.string().optional(),
  stock_quantity: z.number().int().min(0, 'Stock cannot be negative'),
  is_active: z.boolean().default(true),
})

export type OrderFormValues = z.infer<typeof orderFormSchema>
export type ProductFormValues = z.infer<typeof productFormSchema>
