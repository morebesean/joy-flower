'use client'

import { useEffect, useState } from 'react'
import { ProductForm } from '@/components/admin/product-form'

export default function EditProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const [productId, setProductId] = useState<string>('')
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    params.then((p) => setProductId(p.productId))
  }, [params])

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch product')
      }

      const data = await response.json()
      setProduct({
        name: data.name,
        description: data.description || '',
        price: data.price.toString(),
        category: data.category,
        stock_quantity: data.stock_quantity.toString(),
        image_url: data.image_url || '',
        is_active: data.is_active,
      })
    } catch (err) {
      console.error('Failed to fetch product:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch product')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading product...</div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="text-center py-8 text-red-600">
        Error: {error || 'Product not found'}
      </div>
    )
  }

  return <ProductForm mode="edit" initialData={product} productId={productId} />
}
