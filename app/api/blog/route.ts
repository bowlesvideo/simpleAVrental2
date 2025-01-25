import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const post = await prisma.blogPost.create({
      data: json,
    })

    revalidatePath('/blog')
    revalidatePath('/admin/blog')
    
    return NextResponse.json(post)
  } catch (error) {
    console.error('Failed to create blog post:', error)
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const json = await request.json()
    const { id, ...data } = json
    
    const post = await prisma.blogPost.update({
      where: { id },
      data,
    })

    revalidatePath('/blog')
    revalidatePath(`/blog/${post.slug}`)
    revalidatePath('/admin/blog')
    
    return NextResponse.json(post)
  } catch (error) {
    console.error('Failed to update blog post:', error)
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
} 