import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdminSession } from '@/lib/auth/admin'

export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await verifyAdminSession(token)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // 1. Get total revenue and order count
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('total_amount, payment_status, status')

    if (ordersError) {
      console.error('Failed to fetch orders:', ordersError)
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      )
    }

    // Calculate total revenue (only paid orders)
    const totalRevenue = orders
      ?.filter((order) => order.payment_status === 'paid')
      .reduce((sum, order) => sum + order.total_amount, 0) || 0

    const totalOrders = orders?.length || 0

    // Count pending orders
    const pendingOrders = orders?.filter(
      (order) => order.status === 'pending' || order.status === 'confirmed'
    ).length || 0

    // 2. Get low stock products (stock_quantity < 10)
    const { data: lowStockProducts, error: lowStockError } = await supabase
      .from('products')
      .select('id')
      .lt('stock_quantity', 10)
      .eq('is_active', true)

    if (lowStockError) {
      console.error('Failed to fetch low stock products:', lowStockError)
    }

    const lowStockCount = lowStockProducts?.length || 0

    // 3. Get recent orders (last 5)
    const { data: recentOrders, error: recentOrdersError } = await supabase
      .from('orders')
      .select('id, order_number, buyer_name, total_amount, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentOrdersError) {
      console.error('Failed to fetch recent orders:', recentOrdersError)
    }

    // 4. Get top products (most ordered)
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        products (
          id,
          name,
          price,
          image_url
        )
      `)

    if (orderItemsError) {
      console.error('Failed to fetch order items:', orderItemsError)
    }

    // Calculate top products by quantity sold
    const productSales = new Map<string, {
      product: any,
      totalQuantity: number
    }>()

    orderItems?.forEach((item: any) => {
      const productId = item.product_id
      const existing = productSales.get(productId)

      if (existing) {
        existing.totalQuantity += item.quantity
      } else {
        productSales.set(productId, {
          product: item.products,
          totalQuantity: item.quantity,
        })
      }
    })

    // Sort by quantity and get top 5
    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5)
      .map((item) => ({
        ...item.product,
        totalSold: item.totalQuantity,
      }))

    // 5. Revenue by date (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentRevenue, error: revenueError } = await supabase
      .from('orders')
      .select('total_amount, payment_status, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .eq('payment_status', 'paid')

    if (revenueError) {
      console.error('Failed to fetch revenue data:', revenueError)
    }

    // Group revenue by date
    const revenueByDate = new Map<string, number>()

    recentRevenue?.forEach((order) => {
      const date = new Date(order.created_at).toISOString().split('T')[0]
      const existing = revenueByDate.get(date) || 0
      revenueByDate.set(date, existing + order.total_amount)
    })

    const revenueData = Array.from(revenueByDate.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      pendingOrders,
      lowStockProducts: lowStockCount,
      recentOrders: recentOrders || [],
      topProducts: topProducts || [],
      revenueByDate: revenueData,
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
