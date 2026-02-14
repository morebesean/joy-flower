'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/admin/stat-card'
import { RecentOrdersTable } from '@/components/admin/recent-orders-table'
import { DollarSign, ShoppingCart, Clock, PackageX } from 'lucide-react'

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  pendingOrders: number
  lowStockProducts: number
  recentOrders: Array<{
    id: string
    order_number: string
    buyer_name: string
    total_amount: number
    status: string
    created_at: string
  }>
  topProducts: Array<{
    id: string
    name: string
    price: number
    image_url: string | null
    totalSold: number
  }>
  revenueByDate: Array<{
    date: string
    revenue: number
  }>
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')

        if (!response.ok) {
          throw new Error('Failed to fetch statistics')
        }

        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error('Failed to fetch stats:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to Joy Flower Admin Panel</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading statistics...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to Joy Flower Admin Panel</p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to Joy Flower Admin Panel</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={DollarSign}
          description="From all paid orders"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={ShoppingCart}
          description="All time orders"
        />
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders || 0}
          icon={Clock}
          description="Requires attention"
        />
        <StatCard
          title="Low Stock"
          value={stats?.lowStockProducts || 0}
          icon={PackageX}
          description="Products below 10 units"
        />
      </div>

      {/* Recent Orders */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest 5 orders from customers</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentOrdersTable orders={stats?.recentOrders || []} />
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
          <CardDescription>Best selling products by quantity</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.topProducts && stats.topProducts.length > 0 ? (
            <div className="space-y-4">
              {stats.topProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                        <PackageX className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{product.totalSold}</p>
                    <p className="text-sm text-gray-500">sold</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No product sales yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
