'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ProductFormData {
  name: string
  description: string
  price: string
  category: string
  stock_quantity: string
  image_url: string
  is_active: boolean
}

interface ProductFormProps {
  initialData?: ProductFormData
  productId?: string
  mode: 'create' | 'edit'
}

export function ProductForm({ initialData, productId, mode }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ProductFormData>(
    initialData || {
      name: '',
      description: '',
      price: '',
      category: 'roses',
      stock_quantity: '',
      image_url: '',
      is_active: true,
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        category: formData.category,
        stock_quantity: parseInt(formData.stock_quantity),
        image_url: formData.image_url || null,
        is_active: formData.is_active,
      }

      const url =
        mode === 'create'
          ? '/api/admin/products'
          : `/api/admin/products/${productId}`

      const method = mode === 'create' ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${mode} product`)
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      console.error(`Failed to ${mode} product:`, err)
      alert(`Failed to ${mode} product`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    field: keyof ProductFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {mode === 'create' ? 'Add New Product' : 'Edit Product'}
        </h1>
        <p className="text-gray-600 mt-2">
          {mode === 'create'
            ? 'Create a new product in your catalog'
            : 'Update product information'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>
              Fill in the product details below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Product Name <span className="text-red-600">*</span>
              </Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Red Rose Bouquet"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Product description..."
                rows={4}
              />
            </div>

            {/* Price and Category */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price (USD) <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="roses">Roses</SelectItem>
                    <SelectItem value="tulips">Tulips</SelectItem>
                    <SelectItem value="lilies">Lilies</SelectItem>
                    <SelectItem value="orchids">Orchids</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stock and Image URL */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">
                  Stock Quantity <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  min="0"
                  required
                  value={formData.stock_quantity}
                  onChange={(e) => handleChange('stock_quantity', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => handleChange('image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            {/* Image Preview */}
            {formData.image_url && (
              <div className="space-y-2">
                <Label>Image Preview</Label>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <img
                    src={formData.image_url}
                    alt="Product preview"
                    className="w-full max-w-xs rounded object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleChange('is_active', checked)}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active (visible to customers)
              </Label>
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading
                  ? mode === 'create'
                    ? 'Creating...'
                    : 'Updating...'
                  : mode === 'create'
                  ? 'Create Product'
                  : 'Update Product'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/products')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
