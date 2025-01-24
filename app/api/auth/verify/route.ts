import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'

// Hash the token for verification
function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  if (!token || !email) {
    return NextResponse.json({ error: 'Missing token or email' }, { status: 400 })
  }

  console.log('Verifying token:', { email, token })

  // Hash the token before checking
  const hashedToken = hashToken(token)

  // Verify token
  const authToken = await prisma.authToken.findFirst({
    where: {
      email,
      token: hashedToken,
      expires: {
        gt: new Date()
      }
    }
  })

  console.log('Auth token found:', authToken)

  if (!authToken) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
  }

  // Delete used token
  await prisma.authToken.delete({
    where: { email }
  })

  // Set auth cookie
  const cookieStore = cookies()
  cookieStore.set('authEmail', email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 28 // 28 days
  })

  // Redirect to orders page
  return NextResponse.redirect(new URL('/customer/orders', request.url))
} 