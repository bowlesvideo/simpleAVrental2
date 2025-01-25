import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BlogEditor } from '@/components/blog-editor'

export const metadata: Metadata = {
  title: 'Edit Blog Post',
}

export const dynamic = 'force-dynamic'

interface Props {
  params: {
    id: string
  }
}

async function getBlogPost(id: string) {
  if (id === 'new') {
    return {
      id: 'new',
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      published: false,
      publishedAt: null,
      author: '',
      coverImage: '',
      tags: [],
      seoTitle: '',
      seoDesc: ''
    }
  }

  const post = await prisma.blogPost.findUnique({
    where: { id }
  })

  if (!post) notFound()
  return post
}

export default async function BlogEditPage({ params }: Props) {
  const post = await getBlogPost(params.id)

  return (
    <div className="container mx-auto py-10">
      <BlogEditor post={post} />
    </div>
  )
} 