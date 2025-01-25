'use client'

import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { SITE_NAME } from '@/lib/constants'
import { JsonLd } from '@/components/json-ld'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImage: string | null
  publishedAt: Date | null
  author: string | null
  tags: string[]
  published: boolean
  createdAt: Date
  updatedAt: Date
}

interface BlogListProps {
  posts: BlogPost[]
}

export function BlogList({ posts }: BlogListProps) {
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": `${SITE_NAME} Blog`,
    "description": `Read the latest articles about video production, live events, and corporate communications from ${SITE_NAME}.`,
    "url": "https://govideopro.com/blog",
    "blogPost": posts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "datePublished": post.publishedAt?.toISOString(),
      "dateModified": post.updatedAt.toISOString(),
      "author": {
        "@type": "Person",
        "name": post.author || SITE_NAME
      },
      "url": `/blog/${post.slug}`,
      "image": post.coverImage || "/images/default-blog-image.jpg",
      "keywords": post.tags.join(", ")
    }))
  }

  return (
    <>
      <JsonLd data={blogSchema} />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Blog</h1>
          
          <div className="grid gap-8">
            {posts.map((post) => (
              <article key={post.id} className="group">
                <Link href={`/blog/${post.slug}`}>
                  <div className="grid md:grid-cols-4 gap-6">
                    {post.coverImage && (
                      <div className="relative aspect-video md:aspect-square overflow-hidden rounded-lg">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className={post.coverImage ? "md:col-span-3" : "md:col-span-4"}>
                      <div className="space-y-2">
                        <h2 className="text-2xl font-semibold group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="text-gray-600">{post.excerpt}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {post.author && (
                            <span>{post.author}</span>
                          )}
                          {post.publishedAt && (
                            <time dateTime={post.publishedAt.toISOString()}>
                              {format(post.publishedAt, 'MMMM d, yyyy')}
                            </time>
                          )}
                        </div>
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-1 text-sm bg-gray-100 text-gray-600 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  )
} 