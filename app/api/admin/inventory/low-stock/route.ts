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

    const { searchParams } = new URL(request.url)
    const threshold = parseInt(searchParams.get('threshold') || '10')

    const supabase = createAdminClient()

    // Get products with low stock
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .lt('stock_quantity', threshold)
      .eq('is_active', true)
      .order('stock_quantity', { ascending: true })

    if (error) {
      console.error('Failed to fetch low stock products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch low stock products' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      products: products || [],
      threshold,
      count: products?.length || 0,
    })
  } catch (error) {
    console.error('Low stock API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
