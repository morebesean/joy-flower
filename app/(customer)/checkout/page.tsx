'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/hooks/use-cart"
import { ArrowLeft, CreditCard } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { orderFormSchema, type OrderFormValues } from "@/lib/validators/order.validator"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, getItemCount } = useCart()
  const [mounted, setMounted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      deliveryType: 'delivery',
    },
  })

  const deliveryType = watch('deliveryType')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if cart is empty
  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push('/cart')
    }
  }, [mounted, items.length, router])

  const onSubmit = async (data: OrderFormValues) => {
    setSubmitting(true)

    try {
      // Stripe Checkout API 호출
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderData: data,
          items: items,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create checkout session')
      }

      // Stripe Checkout으로 리다이렉트
      if (result.url) {
        window.location.href = result.url
      } else {
        throw new Error('Checkout URL not found')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert(error instanceof Error ? error.message : '오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted || items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/cart" className="flex items-center gap-2 text-pink-600 hover:text-pink-700">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Cart</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Order Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Buyer Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="buyerName">Your Name *</Label>
                    <Input
                      id="buyerName"
                      {...register('buyerName')}
                      placeholder="John Doe"
                      className={errors.buyerName ? 'border-red-500' : ''}
                    />
                    {errors.buyerName && (
                      <p className="text-sm text-red-600 mt-1">{errors.buyerName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="buyerPhone">Your Phone Number *</Label>
                    <Input
                      id="buyerPhone"
                      {...register('buyerPhone')}
                      type="tel"
                      placeholder="+1 671 123 4567"
                      className={errors.buyerPhone ? 'border-red-500' : ''}
                    />
                    {errors.buyerPhone && (
                      <p className="text-sm text-red-600 mt-1">{errors.buyerPhone.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="buyerEmail">Your Email *</Label>
                    <Input
                      id="buyerEmail"
                      {...register('buyerEmail')}
                      type="email"
                      placeholder="john@example.com"
                      className={errors.buyerEmail ? 'border-red-500' : ''}
                    />
                    {errors.buyerEmail && (
                      <p className="text-sm text-red-600 mt-1">{errors.buyerEmail.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recipient Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Recipient Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="recipientName">Recipient Name *</Label>
                    <Input
                      id="recipientName"
                      {...register('recipientName')}
                      placeholder="Jane Smith"
                      className={errors.recipientName ? 'border-red-500' : ''}
                    />
                    {errors.recipientName && (
                      <p className="text-sm text-red-600 mt-1">{errors.recipientName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="recipientPhone">Recipient Phone *</Label>
                    <Input
                      id="recipientPhone"
                      {...register('recipientPhone')}
                      type="tel"
                      placeholder="+1 671 987 6543"
                      className={errors.recipientPhone ? 'border-red-500' : ''}
                    />
                    {errors.recipientPhone && (
                      <p className="text-sm text-red-600 mt-1">{errors.recipientPhone.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="recipientAddress">Delivery Address *</Label>
                    <Textarea
                      id="recipientAddress"
                      {...register('recipientAddress')}
                      placeholder="123 Main Street, Tamuning, Guam 96913"
                      rows={3}
                      className={errors.recipientAddress ? 'border-red-500' : ''}
                    />
                    {errors.recipientAddress && (
                      <p className="text-sm text-red-600 mt-1">{errors.recipientAddress.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="mb-3 block">Delivery Method *</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        deliveryType === 'delivery' ? 'border-pink-600 bg-pink-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          {...register('deliveryType')}
                          value="delivery"
                          className="mr-3"
                        />
                        <div>
                          <div className="font-semibold">Delivery</div>
                          <div className="text-sm text-gray-600">We'll deliver to your address</div>
                        </div>
                      </label>

                      <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        deliveryType === 'pickup' ? 'border-pink-600 bg-pink-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          {...register('deliveryType')}
                          value="pickup"
                          className="mr-3"
                        />
                        <div>
                          <div className="font-semibold">Pickup</div>
                          <div className="text-sm text-gray-600">Collect from our shop</div>
                        </div>
                      </label>
                    </div>
                    {errors.deliveryType && (
                      <p className="text-sm text-red-600 mt-1">{errors.deliveryType.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="deliveryDate">Preferred Date</Label>
                      <Input
                        id="deliveryDate"
                        {...register('deliveryDate')}
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        className={errors.deliveryDate ? 'border-red-500' : ''}
                      />
                      {errors.deliveryDate && (
                        <p className="text-sm text-red-600 mt-1">{errors.deliveryDate.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="deliveryTime">Preferred Time</Label>
                      <Input
                        id="deliveryTime"
                        {...register('deliveryTime')}
                        type="time"
                        className={errors.deliveryTime ? 'border-red-500' : ''}
                      />
                      {errors.deliveryTime && (
                        <p className="text-sm text-red-600 mt-1">{errors.deliveryTime.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="messageCard">Message Card (Optional)</Label>
                    <Textarea
                      id="messageCard"
                      {...register('messageCard')}
                      placeholder="Add a personal message..."
                      rows={3}
                      maxLength={200}
                      className={errors.messageCard ? 'border-red-500' : ''}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {watch('messageCard')?.length || 0}/200 characters
                    </p>
                    {errors.messageCard && (
                      <p className="text-sm text-red-600 mt-1">{errors.messageCard.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.productId} className="flex gap-3 text-sm">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">🌷</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-gray-600">Qty: {item.quantity}</p>
                          <p className="font-semibold text-pink-600">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({getItemCount()} items)</span>
                      <span className="font-semibold">${getTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-semibold">
                        {deliveryType === 'delivery' ? 'TBD' : 'Free'}
                      </span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="text-2xl font-bold text-pink-600">
                          ${getTotal().toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Final amount calculated at payment
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-pink-600 hover:bg-pink-700"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Proceed to Payment
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-gray-500">
                    You'll be redirected to Stripe for secure payment
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
