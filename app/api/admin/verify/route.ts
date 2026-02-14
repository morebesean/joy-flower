import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/auth/admin'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      return NextResponse.json({ isAdmin: false })
    }

    const session = await verifyAdminSession(token)

    if (!session) {
      return NextResponse.json({ isAdmin: false })
    }

    return NextResponse.json({
      isAdmin: true,
      username: session.username,
    })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ isAdmin: false })
  }
}
