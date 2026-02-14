'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Package, AlertTriangle, Plus, Minus, Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Product {
  id: string
  name: string
  category: string
  stock_quantity: number
  price: number
  image_url: string | null
  is_active: boolean
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Adjustment dialog state
  const [adjustDialog, setAdjustDialog] = useState<{
    open: boolean
    product: Product | null
  }>({
    open: false,
    product: null,
  })
  const [adjusting, setAdjusting] = useState(false)
  const [adjustmentData, setAdjustmentData] = useState({
    quantity_change: '',
    reason: 'adjustment',
    notes: '',
  })

  useEffect(() => {
    fetchProducts()
    fetchLowStock()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/products?limit=100')

      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      setProducts(data.products)
    } catch (err) {
      console.error('Failed to fetch products:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const fetchLowStock = async () => {
    try {
      const response = await fetch('/api/admin/inventory/low-stock')

      if (!response.ok) {
        throw new Error('Failed to fetch low stock products')
      }

      const data = await response.json()
      setLowStockProducts(data.products)
    } catch (err) {
      console.error('Failed to fetch low stock:', err)
    }
  }

  const handleQuickAdjust = async (product: Product, change: number) => {
    try {
      const response = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity_change: change,
          reason: 'adjustment',
          notes: `Quick adjustment: ${change > 0 ? '+' : ''}${change}`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to adjust stock')
      }

      // Refresh data
      fetchProducts()
      fetchLowStock()
    } catch (err) {
      console.error('Failed to adjust stock:', err)
      alert('Failed to adjust stock')
    }
  }

  const handleAdjustSubmit = async () => {
    if (!adjustDialog.product) return

    try {
      setAdjusting(true)
      const response = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: adjustDialog.product.id,
          quantity_change: parseInt(adjustmentData.quantity_change),
          reason: adjustmentData.reason,
          notes: adjustmentData.notes || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to adjust stock')
      }

      // Reset and close dialog
      setAdjustDialog({ open: false, product: null })
      setAdjustmentData({ quantity_change: '', reason: 'adjustment', notes: '' })

      // Refresh data
      fetchProducts()
      fetchLowStock()
    } catch (err) {
      console.error('Failed to adjust stock:', err)
      alert(err instanceof Error ? err.message : 'Failed to adjust stock')
    } finally {
      setAdjusting(false)
    }
  }

  const openAdjustDialog = (product: Product) => {
    setAdjustDialog({ open: true, product })
    setAdjustmentData({ quantity_change: '', reason: 'adjustment', notes: '' })
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  )

  const getStockColor = (quantity: number) => {
    if (quantity < 10) return 'text-red-600'
    if (quantity < 20) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600 mt-2">Manage stock levels and track inventory</p>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
            <CardDescription className="text-yellow-700">
              {lowStockProducts.length} {lowStockProducts.length === 1 ? 'product has' : 'products have'} low stock (less than 10 units)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-white rounded border border-yellow-200"
                >
                  <div className="flex items-center gap-3">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-red-600 font-medium">
                        Only {product.stock_quantity} left
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => openAdjustDialog(product)}
                  >
                    Adjust Stock
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Levels</CardTitle>
          <CardDescription>Current inventory for all products</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading inventory...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">Error: {error}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No products found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Product
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Stock
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Quick Adjust
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            {!product.is_active && (
                              <Badge variant="outline" className="mt-1">
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">
                          {product.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-lg font-bold ${getStockColor(product.stock_quantity)}`}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickAdjust(product, -10)}
                            disabled={product.stock_quantity < 10}
                          >
                            -10
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickAdjust(product, -1)}
                            disabled={product.stock_quantity < 1}
                          >
                            -1
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickAdjust(product, 1)}
                          >
                            +1
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickAdjust(product, 10)}
                          >
                            +10
                          </Button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openAdjustDialog(product)}
                        >
                          Adjust Stock
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adjustment Dialog */}
      <Dialog
        open={adjustDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setAdjustDialog({ open: false, product: null })
            setAdjustmentData({ quantity_change: '', reason: 'adjustment', notes: '' })
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              {adjustDialog.product && (
                <>
                  Current stock: <strong>{adjustDialog.product.stock_quantity}</strong> units
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {adjustDialog.product && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                {adjustDialog.product.image_url ? (
                  <img
                    src={adjustDialog.product.image_url}
                    alt={adjustDialog.product.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{adjustDialog.product.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{adjustDialog.product.category}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantity Change <span className="text-red-600">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter positive or negative number"
                value={adjustmentData.quantity_change}
                onChange={(e) =>
                  setAdjustmentData({ ...adjustmentData, quantity_change: e.target.value })
                }
              />
              <p className="text-xs text-gray-500">
                Use positive numbers to add stock, negative to remove
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason <span className="text-red-600">*</span>
              </Label>
              <Select
                value={adjustmentData.reason}
                onValueChange={(value) =>
                  setAdjustmentData({ ...adjustmentData, reason: value })
                }
              >
                <SelectTrigger id="reason">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="return">Return</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Optional notes..."
                value={adjustmentData.notes}
                onChange={(e) =>
                  setAdjustmentData({ ...adjustmentData, notes: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAdjustDialog({ open: false, product: null })}
              disabled={adjusting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdjustSubmit}
              disabled={adjusting || !adjustmentData.quantity_change}
            >
              {adjusting ? 'Adjusting...' : 'Adjust Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
