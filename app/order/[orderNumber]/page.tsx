'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Package,
  Truck,
  Calendar,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  ArrowLeft,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"

interface OrderItem {
  id: string
  quantity: number
  price: number
  products: {
    id: string
    name: string
    image_url: string | null
    description: string | null
  }
}

interface Order {
  id: string
  order_number: string
  status: string
  payment_status: string
  payment_method: string | null
  total_amount: number
  buyer_name: string
  buyer_email: string
  buyer_phone: string
  recipient_name: string
  recipient_phone: string
  recipient_address: string
  delivery_type: string
  delivery_date: string | null
  delivery_time: string | null
  message_card: string | null
  created_at: string
  updated_at: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const orderNumber = params.orderNumber as string
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails()
    }
  }, [orderNumber])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/orders/${orderNumber}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError('Order not found')
        } else {
          setError('Failed to fetch order details')
        }
        return
      }

      const data = await response.json()
      setOrder(data.order)
      setItems(data.items)
    } catch (err) {
      console.error('Error fetching order:', err)
      setError('An error occurred while loading the order')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      confirmed: { color: 'bg-green-100 text-green-800', label: 'Confirmed' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      shipped: { color: 'bg-purple-100 text-purple-800', label: 'Shipped' },
      delivered: { color: 'bg-gray-100 text-gray-800', label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    }
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      refunded: { color: 'bg-purple-100 text-purple-800', label: 'Refunded' },
    }
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading order details...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="text-center py-16">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">
                  {error || 'Order Not Found'}
                </h2>
                <p className="text-gray-600 mb-6">
                  We couldn't find the order you're looking for.
                </p>
                <Link href="/">
                  <Button className="bg-pink-600 hover:bg-pink-700">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
                <p className="text-gray-600 mt-1">
                  Order placed on {formatDate(order.created_at)}
                </p>
              </div>
              <div className="flex gap-3">
                {getStatusBadge(order.status)}
                {getPaymentStatusBadge(order.payment_status)}
              </div>
            </div>
          </div>

          {/* Order Number Card */}
          <Card className="mb-6 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
            <CardContent className="py-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Order Number</p>
                <p className="text-2xl font-bold text-gray-900">{order.order_number}</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-600" />
                <CardTitle>Order Items</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start pb-4 border-b last:border-0 last:pb-0">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.products.image_url ? (
                        <Image
                          src={item.products.image_url}
                          alt={item.products.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-lg">{item.products.name}</p>
                      {item.products.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {item.products.description}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-2">
                        Quantity: <span className="font-medium">{item.quantity}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount</span>
                <span className="text-2xl font-bold text-pink-600">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-gray-600" />
                <CardTitle>Delivery Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Delivery Type</p>
                <Badge variant="outline" className="text-sm">
                  {order.delivery_type === 'pickup' ? 'Pickup' : 'Delivery'}
                </Badge>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-gray-600 mb-2">Recipient</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{order.recipient_name}</p>
                      <p className="text-sm text-gray-600">{order.recipient_address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-600">{order.recipient_phone}</p>
                  </div>
                </div>
              </div>

              {order.delivery_date && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Scheduled Delivery</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <p className="text-sm">
                        {order.delivery_date}
                        {order.delivery_time && ` at ${order.delivery_time}`}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {order.message_card && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Message Card</p>
                    <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                      <p className="text-sm text-pink-900 italic">
                        "{order.message_card}"
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Buyer Information */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-gray-600" />
                <CardTitle>Buyer Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{order.buyer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{order.buyer_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{order.buyer_phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gray-600" />
                <CardTitle>Payment Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payment Method</span>
                <span className="font-medium">
                  {order.payment_method ?
                    order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1)
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payment Status</span>
                {getPaymentStatusBadge(order.payment_status)}
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="bg-gray-50">
            <CardContent className="py-6 text-center">
              <p className="text-gray-600 mb-2">Need help with your order?</p>
              <p className="text-sm text-gray-500">
                Contact us at{' '}
                <a href="mailto:support@joy-flower.com" className="text-pink-600 hover:underline">
                  support@joy-flower.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
