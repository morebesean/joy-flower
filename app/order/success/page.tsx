'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Package, Truck, Calendar, MapPin } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { useCart } from "@/lib/hooks/use-cart"
import Image from "next/image"

interface OrderItem {
  id: string
  quantity: number
  price: number
  products: {
    id: string
    name: string
    image_url: string | null
  }
}

interface Order {
  id: string
  order_number: string
  status: string
  payment_status: string
  total_amount: number
  buyer_name: string
  buyer_email: string
  recipient_name: string
  recipient_phone: string
  recipient_address: string
  delivery_type: string
  delivery_date: string | null
  delivery_time: string | null
  message_card: string | null
  created_at: string
}

function OrderSuccessPageContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { clearCart } = useCart()
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 주문 완료 시 장바구니 비우기
    if (sessionId) {
      clearCart()
      fetchOrderDetails()
    }
  }, [sessionId, clearCart])

  const fetchOrderDetails = async () => {
    if (!sessionId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/orders/session/${sessionId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch order details')
      }

      const data = await response.json()
      setOrder(data.order)
      setItems(data.items)
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 p-6">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-3xl">Thank you for your order!</CardTitle>
              <p className="text-gray-600 text-lg mt-2">
                Your payment has been successfully processed.
              </p>
            </CardHeader>

            {loading ? (
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Loading order details...</p>
              </CardContent>
            ) : order ? (
              <CardContent className="space-y-6">
                {/* Order Number and Status */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Order Number</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {order.order_number}
                      </p>
                    </div>
                    <div className="flex flex-col items-start md:items-end">
                      <p className="text-sm text-gray-600 mb-2">Status</p>
                      <Badge className={getStatusBadge(order.status)}>
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Order Items */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-lg">Order Items</h3>
                  </div>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {item.products.image_url ? (
                            <Image
                              src={item.products.image_url}
                              alt={item.products.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">{item.products.name}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(item.price)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Delivery Information */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-lg">Delivery Information</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{order.recipient_name}</p>
                        <p className="text-gray-600">{order.recipient_phone}</p>
                        <p className="text-gray-600">{order.recipient_address}</p>
                      </div>
                    </div>
                    {order.delivery_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <p className="text-gray-600">
                          {order.delivery_date}
                          {order.delivery_time && ` at ${order.delivery_time}`}
                        </p>
                      </div>
                    )}
                    {order.message_card && (
                      <div className="mt-4 p-4 bg-pink-50 rounded-lg border border-pink-200">
                        <p className="text-sm font-medium text-pink-900 mb-1">
                          Message Card
                        </p>
                        <p className="text-sm text-pink-800 italic">
                          "{order.message_card}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Order Total */}
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-bold text-2xl text-pink-600">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>

                {/* Actions */}
                <div className="pt-4 space-y-3">
                  <Link href={`/order/${order.order_number}`} className="block">
                    <Button size="lg" variant="outline" className="w-full">
                      View Order Details
                    </Button>
                  </Link>
                  <Link href="/" className="block">
                    <Button size="lg" className="w-full bg-pink-600 hover:bg-pink-700">
                      Continue Shopping
                    </Button>
                  </Link>
                  <p className="text-sm text-gray-500 text-center">
                    A confirmation email has been sent to {order.buyer_email}
                  </p>
                </div>
              </CardContent>
            ) : (
              <CardContent className="text-center py-8 space-y-6">
                <div>
                  <p className="text-gray-600 text-lg mb-2">
                    Unable to load order details.
                  </p>
                  <p className="text-sm text-gray-500">
                    Your order was successfully placed, but we're having trouble loading the details.
                  </p>
                </div>

                <div className="pt-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Link href="/order/lookup" className="block">
                      <Button size="lg" variant="outline" className="w-full">
                        View Order Details
                      </Button>
                    </Link>
                    <Link href="/" className="block">
                      <Button size="lg" className="w-full bg-pink-600 hover:bg-pink-700">
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>
                  <p className="text-sm text-gray-500">
                    Need help? Contact us at support@joy-flower.com
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-gray-500">Loading order details...</div></div>}>
      <OrderSuccessPageContent />
    </Suspense>
  )
}
