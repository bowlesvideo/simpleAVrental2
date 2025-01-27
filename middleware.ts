import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Handle auth routes
  if (path.startsWith('/auth/')) {
    const token = await getToken({ req: request })
    const isAuth = !!token
    const isSignUpPage = path === '/auth/signup'

    // Redirect authenticated users away from auth pages (except signup)
    if (!isSignUpPage && isAuth) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return null
  }

  // Handle customer routes
  if (path.startsWith('/customer/')) {
    // Get the auth cookie
    const authCookie = request.cookies.get('authEmail')
    
    // If no auth cookie is present, redirect to login
    if (!authCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Get the customer email from the cookie
    const customerEmail = authCookie.value

    // For now, we'll just verify that they have an auth cookie
    // In the future, we might want to verify the email matches the requested customer's email
  }

  // Handle admin routes
  if (path.startsWith('/api/admin/')) {
    const token = await getToken({ req: request })
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  // Only apply to /api/update-config
  if (path === '/api/update-config') {
    return NextResponse.next({
      headers: {
        'Transfer-Encoding': 'chunked',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/auth/signin',
    '/auth/signup',
    '/customer/:path*',
    '/api/admin/:path*',
    '/api/:path*',
  ]
}