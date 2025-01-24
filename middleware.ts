import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequestWithAuth } from 'next-auth/middleware'
import type { NextRequest } from 'next/server'

export default async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ req: request })
  const isAuth = !!token
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isSignUpPage = request.nextUrl.pathname === '/auth/signup'
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')

  // Redirect authenticated users away from auth pages (except signup)
  if (isAuthPage && !isSignUpPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return null
  }

  return null
}

// Protect these routes
export const config = {
  matcher: [
    '/auth/signin',
    '/profile/:path*',
    '/api/admin/:path*',
  ]
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check if the path starts with /customer/
  if (path.startsWith('/customer/')) {
    // Get the auth cookie
    const authCookie = request.cookies.get('auth')
    
    // If no auth cookie is present, redirect to login
    if (!authCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Get the customer ID from the URL
    const customerId = path.split('/')[2]

    // If the auth cookie value doesn't match the customer ID in the URL,
    // redirect to login (this prevents accessing other customers' orders)
    if (authCookie.value !== customerId) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/customer/:customerId*',
  ]
}