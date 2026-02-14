'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Package, CreditCard, User, MapPin } from 'lucide-react'

interface OrderItem {
  id: string
  product_id: string
  quantity: number
  price: number
  products: {
    id: string
    name: string
    price: number
    image_url: string | null
  }
}

interface Order {
  id: string
  order_number: string
  buyer_name: string
  buyer_email: string
  buyer_phone: string
  delivery_address: string
  delivery_city: string
  delivery_state: string
  delivery_zip: string
  delivery_country: string
  total_amount: number
  status: string
  payment_status: string
  stripe_session_id: string | null
  created_at: string
  updated_at: string
  items: OrderItem[]
}

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const router = useRouter()
  const [orderId, setOrderId] = useState<string>('')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    params.then((p) => setOrderId(p.orderId))
  }, [params])

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail()
    }
  }, [orderId])

  const fetchOrderDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/orders/${orderId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch order details')
      }

      const data = await response.json()
      setOrder(data)
    } catch (err) {
      console.error('Failed to fetch order:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch order')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      const updatedOrder = await response.json()
      setOrder({ ...order, status: updatedOrder.status, updated_at: updatedOrder.updated_at })
    } catch (err) {
      console.error('Failed to update status:', err)
      alert('Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return statusConfig[status] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    }
    return statusConfig[status] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading order details...</div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error || 'Order not found'}</p>
            <Button
              variant="outline"
              onClick={() => router.push('/admin/orders')}
              className="mt-4"
            >
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/orders">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order {order.order_number}</h1>
            <p className="text-gray-600 mt-2">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className={getPaymentBadge(order.payment_status)}>
              {order.payment_status}
            </Badge>
            <Badge className={getStatusBadge(order.status)}>
              {order.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
              <CardDescription>
                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 border-b pb-4 last:border-0"
                  >
                    {item.products.image_url ? (
                      <img
                        src={item.products.image_url}
                        alt={item.products.name}
                        className="w-16 h-16 rounded object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.products.name}</h3>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="font-medium text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Payment Status</dt>
                  <dd>
                    <Badge className={getPaymentBadge(order.payment_status)}>
                      {order.payment_status}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Total Amount</dt>
                  <dd className="font-medium text-gray-900">
                    {formatCurrency(order.total_amount)}
                  </dd>
                </div>
                {order.stripe_session_id && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Stripe Session</dt>
                    <dd className="text-sm text-gray-900 font-mono">
                      {order.stripe_session_id.substring(0, 20)}...
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={order.status}
                onValueChange={handleStatusUpdate}
                disabled={updating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {updating && (
                <p className="text-sm text-gray-500 mt-2">Updating status...</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Last updated: {formatDate(order.updated_at)}
              </p>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-600">Name</dt>
                  <dd className="font-medium text-gray-900">{order.buyer_name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Email</dt>
                  <dd className="text-sm text-gray-900">{order.buyer_email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Phone</dt>
                  <dd className="text-sm text-gray-900">{order.buyer_phone}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <address className="not-italic text-sm text-gray-900">
                {order.delivery_address}
                <br />
                {order.delivery_city}, {order.delivery_state} {order.delivery_zip}
                <br />
                {order.delivery_country}
              </address>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
