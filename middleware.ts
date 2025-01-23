import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequestWithAuth } from 'next-auth/middleware'

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