import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Add authentication check if needed
  const isAuthenticated = request.cookies.has('auth-token') // example check

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/app/dashboard/:path*',
    '/jobs/:path*',
    '/gpu-owners/:path*'
  ]
}