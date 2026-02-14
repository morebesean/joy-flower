import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'
import { generateOrderNumber } from '@/lib/utils/order'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderData, items } = body

    // 1. 검증: 장바구니가 비어있는지 확인
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // 2. Supabase 클라이언트 생성
    const supabase = await createClient()

    // 3. 재고 확인
    for (const item of items) {
      const { data: product, error } = await supabase
        .from('products')
        .select('stock_quantity, is_active')
        .eq('id', item.productId)
        .single()

      if (error || !product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        )
      }

      if (!product.is_active) {
        return NextResponse.json(
          { error: `Product ${item.productId} is not available` },
          { status: 400 }
        )
      }

      if (product.stock_quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${item.productId}` },
          { status: 400 }
        )
      }
    }

    // 4. 총 금액 계산
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    )

    // 5. 주문 번호 생성
    const orderNumber = generateOrderNumber()

    // 6. Supabase에 주문 생성
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        buyer_name: orderData.buyerName,
        buyer_phone: orderData.buyerPhone,
        buyer_email: orderData.buyerEmail,
        recipient_name: orderData.recipientName,
        recipient_phone: orderData.recipientPhone,
        recipient_address: orderData.recipientAddress,
        delivery_type: orderData.deliveryType,
        delivery_date: orderData.deliveryDate || null,
        delivery_time: orderData.deliveryTime || null,
        message_card: orderData.messageCard || null,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Order creation failed:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // 7. Supabase에 주문 항목 저장
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Order items creation failed:', itemsError)
      // 주문도 삭제 (롤백)
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      )
    }

    // 8. Stripe Checkout Session 생성
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: `Quantity: ${item.quantity}`,
          },
          unit_amount: Math.round(item.price * 100), // Stripe는 센트 단위
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout`,
      metadata: {
        orderId: order.id.toString(),
        orderNumber: order.order_number,
      },
      customer_email: orderData.buyerEmail,
    })

    // 9. Stripe Session ID를 주문에 저장 (admin client 사용)
    const adminClient = createAdminClient()
    const { error: sessionUpdateError } = await adminClient
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id)

    if (sessionUpdateError) {
      console.error('Failed to update stripe_session_id:', sessionUpdateError)
      // 에러가 발생해도 계속 진행 (webhook에서 업데이트될 것임)
    }

    // 10. 성공 응답
    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      orderId: order.id,
      orderNumber: order.order_number,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
