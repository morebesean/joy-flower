import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminSession } from './lib/auth/admin'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the request is for admin routes (excluding login page)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      // No token, redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Verify the token
    const session = await verifyAdminSession(token)

    if (!session) {
      // Invalid token, redirect to login
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      // Clear the invalid token
      response.cookies.set('admin_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      })
      return response
    }

    // Valid session, allow the request to proceed
    return NextResponse.next()
  }

  // For admin login page, redirect to dashboard if already logged in
  if (pathname === '/admin/login') {
    const token = request.cookies.get('admin_token')?.value

    if (token) {
      const session = await verifyAdminSession(token)
      if (session) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
