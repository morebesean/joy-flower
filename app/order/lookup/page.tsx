'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function OrderLookupPage() {
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!orderNumber.trim()) {
      setError('Please enter an order number')
      return
    }

    // 주문 번호 형식 검증 (ORD-YYYYMMDD-XXXX)
    const orderNumberPattern = /^ORD-\d{8}-\d{4}$/
    if (!orderNumberPattern.test(orderNumber.trim())) {
      setError('Invalid order number format. Example: ORD-20260214-1234')
      return
    }

    // 주문 상세 페이지로 이동
    router.push(`/order/${orderNumber.trim()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-pink-100 p-6">
                  <Search className="h-16 w-16 text-pink-600" />
                </div>
              </div>
              <CardTitle className="text-3xl">Order Lookup</CardTitle>
              <p className="text-gray-600 mt-2">
                Enter your order number to view order details
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input
                    id="orderNumber"
                    type="text"
                    placeholder="ORD-20260214-1234"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className={error ? 'border-red-500' : ''}
                  />
                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    You can find your order number in the confirmation email
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-pink-600 hover:bg-pink-700"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search Order
                </Button>
              </form>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  Need help finding your order?
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Check your email for the order confirmation</li>
                  <li>• Order number format: ORD-YYYYMMDD-XXXX</li>
                  <li>• Contact support@joy-flower.com for assistance</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
