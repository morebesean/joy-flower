'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/hooks/use-cart"
import { ShoppingCart } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Product } from "@/lib/types/database.types"
import Link from "next/link"

export default function Home() {
  const { items, addItem, getItemCount, getTotal } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    async function fetchProducts() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('상품 로딩 실패:', error)
      } else {
        setProducts(data || [])
      }
      setLoading(false)
    }

    fetchProducts()
  }, [])

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-pink-600">🌸 Joy-Flower</h1>
            <p className="text-sm text-gray-600">Guam&apos;s Premier Flower Shop</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/cart">
              <Button variant="outline" className="relative">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
                {mounted && getItemCount() > 0 && (
                  <Badge className="ml-2 bg-pink-600">{getItemCount()}</Badge>
                )}
              </Button>
            </Link>
            {mounted && getTotal() > 0 && (
              <div className="text-sm font-semibold">
                Total: ${getTotal().toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-4">
          Fresh Flowers Delivered in Guam
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Beautiful bouquets and arrangements for every occasion.
          Local delivery and pickup available.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="bg-pink-600 hover:bg-pink-700">
            Shop Now
          </Button>
          <Button size="lg" variant="outline">
            View Admin Demo
          </Button>
        </div>
      </section>

      {/* Status Badges */}
      <section className="container mx-auto px-4 pb-8">
        <div className="flex gap-4 justify-center flex-wrap">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            ✅ Next.js 16 Setup Complete
          </Badge>
          <Badge variant="secondary" className="text-sm px-4 py-2">
            ✅ TypeScript Configured
          </Badge>
          <Badge variant="secondary" className="text-sm px-4 py-2">
            ✅ Tailwind CSS Active
          </Badge>
          <Badge variant="secondary" className="text-sm px-4 py-2">
            ✅ shadcn/ui Components
          </Badge>
          <Badge variant="secondary" className="text-sm px-4 py-2">
            ✅ Zustand Cart Working
          </Badge>
          <Badge variant="secondary" className="text-sm px-4 py-2 bg-green-100 text-green-800">
            ✅ Supabase Connected
          </Badge>
          <Badge variant="secondary" className="text-sm px-4 py-2 bg-purple-100 text-purple-800">
            ✅ Stripe Ready
          </Badge>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-2">Featured Flowers</h3>
        <p className="text-center text-gray-600 mb-8">
          {loading ? 'Loading products from Supabase...' : `${products.length} products from Supabase database`}
        </p>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-6xl">🌷</span>
                </div>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xl font-bold text-pink-600">
                    ${product.price.toFixed(2)}
                  </span>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
                <p className="text-sm text-gray-500">
                  {product.stock_quantity} in stock
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-pink-600 hover:bg-pink-700"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
            ))}
          </div>
        )}
      </section>

      {/* Cart Preview */}
      {mounted && items.length > 0 && (
        <section className="container mx-auto px-4 pb-16">
          <Card className="max-w-2xl mx-auto bg-pink-50 border-pink-200">
            <CardHeader>
              <CardTitle>Cart Preview (Testing Zustand)</CardTitle>
              <CardDescription>
                Your cart state is managed with Zustand and persisted to localStorage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4 text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-pink-600">${getTotal().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-pink-600 hover:bg-pink-700">
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </section>
      )}

      {/* Info Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Next Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>1️⃣</span> Supabase Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ Create Supabase project</li>
                  <li>✓ Run database schema</li>
                  <li>✓ Create storage bucket</li>
                  <li>✓ Add environment variables</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>2️⃣</span> Stripe Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ Create Stripe account</li>
                  <li>✓ Get test API keys</li>
                  <li>✓ Configure payment methods</li>
                  <li>✓ Test with test cards</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>3️⃣</span> Build Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ Customer pages</li>
                  <li>✓ Admin dashboard</li>
                  <li>✓ Payment integration</li>
                  <li>✓ Deploy to Vercel</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            Built with Next.js, TypeScript, Supabase, and Stripe
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Joy-Flower &copy; 2026 - Guam&apos;s Premier Flower Shop
          </p>
        </div>
      </footer>
    </div>
  )
}
