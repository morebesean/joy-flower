import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('No Stripe signature found')
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      )
    }

    // Stripe 웹훅 서명 검증
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // 이벤트 타입별 처리
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        console.log('✅ Checkout session completed:', session.id)

        // metadata에서 주문 정보 가져오기
        const orderId = session.metadata?.orderId
        const orderNumber = session.metadata?.orderNumber

        if (!orderId) {
          console.error('No orderId in session metadata')
          break
        }

        // Supabase Admin 클라이언트 생성 (service role key 사용)
        const supabase = createAdminClient()

        // 주문 상태 업데이트
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'confirmed',
            payment_status: 'paid',
            payment_method: 'card',
            stripe_payment_id: session.payment_intent as string,
            stripe_session_id: session.id,
          })
          .eq('id', orderId)

        if (updateError) {
          console.error('Failed to update order:', updateError)
          return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
          )
        }

        console.log(`✅ Order ${orderNumber} updated to confirmed/paid`)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('✅ Payment succeeded:', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('❌ Payment failed:', paymentIntent.id)

        // TODO: 결제 실패 시 주문 상태 업데이트 또는 알림
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
