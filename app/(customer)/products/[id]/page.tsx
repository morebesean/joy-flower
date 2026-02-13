'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/hooks/use-cart"
import { ArrowLeft, ShoppingCart, Minus, Plus, Package } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Product } from "@/lib/types/database.types"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        console.error('상품 로딩 실패:', error)
        setProduct(null)
      } else {
        setProduct(data)
      }
      setLoading(false)
    }

    fetchProduct()
  }, [params.id])

  const handleAddToCart = () => {
    if (!product) return

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image_url: product.image_url,
    })

    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <Package className="h-24 w-24 mx-auto text-gray-300" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Product Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              Sorry, we couldn't find the product you're looking for.
            </p>
            <Link href="/">
              <Button size="lg" className="bg-pink-600 hover:bg-pink-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Shop</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Product Image */}
          <div>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <span className="text-9xl">🌷</span>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <div className="mt-6 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm text-gray-900 mb-3">
                    Product Details
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Fresh and hand-picked
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Same-day delivery available
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Professionally arranged
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Perfect for any occasion
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="space-y-6">
              {/* Title and Category */}
              <div>
                {product.category && (
                  <Badge variant="outline" className="mb-3">
                    {product.category}
                  </Badge>
                )}
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>
                <p className="text-gray-600 leading-relaxed">
                  {product.description || 'Beautiful fresh flowers, perfect for any occasion.'}
                </p>
              </div>

              {/* Price */}
              <div className="border-t border-b py-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-pink-600">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-gray-500">per bouquet</span>
                </div>
              </div>

              {/* Stock Status */}
              <div>
                {product.stock_quantity > 0 ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    <span className="font-semibold">
                      In Stock ({product.stock_quantity} available)
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                    <span className="font-semibold">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="h-12 w-12"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-16 text-center font-semibold text-lg">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      disabled={quantity >= product.stock_quantity}
                      className="h-12 w-12"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.stock_quantity} max
                  </span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full h-14 text-lg bg-pink-600 hover:bg-pink-700"
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0 || addedToCart}
                >
                  {addedToCart ? (
                    <>
                      <span className="mr-2">✓</span>
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart - ${(product.price * quantity).toFixed(2)}
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Link href="/cart" className="w-full">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full"
                    >
                      View Cart
                    </Button>
                  </Link>
                  <Link href="/" className="w-full">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full"
                    >
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Trust Badges */}
              <Card className="bg-pink-50 border-pink-200">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm text-gray-900 mb-3">
                    Why Buy From Us?
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-pink-600">🌸</span>
                      <span className="text-gray-600">Fresh Daily</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-pink-600">🚚</span>
                      <span className="text-gray-600">Fast Delivery</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-pink-600">💝</span>
                      <span className="text-gray-600">Gift Ready</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-pink-600">🔒</span>
                      <span className="text-gray-600">Secure Payment</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
