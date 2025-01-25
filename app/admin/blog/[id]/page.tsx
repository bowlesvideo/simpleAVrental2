import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BlogEditor } from '@/components/blog-editor'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

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
      seoDesc: '',
      createdAt: new Date(),
      updatedAt: new Date()
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
    <div className="min-h-screen bg-gray-100">
      {/* Admin Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900">SimpleAV Admin</span>
              <nav className="ml-10 flex space-x-4">
                <Link 
                  href="/admin"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Packages & Add-ons
                </Link>
                <Link 
                  href="/admin/orders"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Orders
                </Link>
                <Link 
                  href="/admin/blog"
                  className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white"
                >
                  Blog
                </Link>
                <Link 
                  href="/admin/inventory"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Inventory
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link href="/admin/blog">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog Posts
              </Button>
            </Link>
          </div>
          <BlogEditor post={post} />
        </div>
      </div>
    </div>
  )
} 