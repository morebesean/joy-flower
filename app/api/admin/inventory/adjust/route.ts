import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdminSession } from '@/lib/auth/admin'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { product_id, quantity_change, reason, notes } = body

    // Validate required fields
    if (!product_id || quantity_change === undefined || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate reason
    const validReasons = ['purchase', 'sale', 'return', 'adjustment', 'damaged']
    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: 'Invalid reason' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get current product stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('stock_quantity, name')
      .eq('id', product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const newQuantity = product.stock_quantity + quantity_change

    // Prevent negative stock
    if (newQuantity < 0) {
      return NextResponse.json(
        { error: 'Insufficient stock for this adjustment' },
        { status: 400 }
      )
    }

    // Update product stock
    const { error: updateError } = await supabase
      .from('products')
      .update({
        stock_quantity: newQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', product_id)

    if (updateError) {
      console.error('Failed to update stock:', updateError)
      return NextResponse.json(
        { error: 'Failed to update stock' },
        { status: 500 }
      )
    }

    // Create stock history record (if table exists)
    // Note: This assumes stock_history table exists with columns:
    // product_id, quantity_change, quantity_after, reason, notes, created_at
    try {
      await supabase.from('stock_history').insert({
        product_id,
        quantity_change,
        quantity_after: newQuantity,
        reason,
        notes: notes || null,
      })
    } catch (historyError) {
      // If stock_history table doesn't exist, log but don't fail
      console.warn('Stock history not recorded:', historyError)
    }

    return NextResponse.json({
      success: true,
      product: {
        id: product_id,
        name: product.name,
        previous_quantity: product.stock_quantity,
        new_quantity: newQuantity,
        change: quantity_change,
      },
    })
  } catch (error) {
    console.error('Inventory adjust API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
