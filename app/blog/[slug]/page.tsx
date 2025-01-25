import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { prisma } from '@/lib/prisma'
import { SITE_NAME } from '@/lib/constants'
import { JsonLd } from '@/components/json-ld'
import { Badge } from '@/components/ui/badge'
import dynamic from 'next/dynamic'
import React from 'react'
import type { Components } from 'react-markdown'

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

interface Props {
  params: {
    slug: string
  }
}

async function getBlogPost(slug: string) {
  const post = await prisma.blogPost.findUnique({
    where: { slug }
  })

  if (!post || !post.published) notFound()
  return post
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPost(params.slug)
  
  return {
    title: post.seoTitle || `${post.title} - ${SITE_NAME} Blog`,
    description: post.seoDesc || post.excerpt || `Read ${post.title} on the ${SITE_NAME} blog.`,
    openGraph: {
      title: post.seoTitle || `${post.title} - ${SITE_NAME} Blog`,
      description: post.seoDesc || post.excerpt || `Read ${post.title} on the ${SITE_NAME} blog.`,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: post.author ? [post.author] : undefined,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  }
}

type ImageComponentProps = {
  src: string
  alt?: string
  width?: number
  height?: number
  className?: string
}

type CodeComponentProps = {
  inline?: boolean
  className?: string
  children: React.ReactNode
}

const DynamicCodeBlock = dynamic(() => import('@/components/code-block').then(mod => mod.CodeBlock), {
  ssr: false
})

const components: Partial<Components> = {
  h1: ({ children }) => <h1 className="text-4xl font-bold mt-8 mb-4">{children}</h1>,
  h2: ({ children }) => <h2 className="text-3xl font-bold mt-8 mb-4">{children}</h2>,
  h3: ({ children }) => <h3 className="text-2xl font-bold mt-6 mb-3">{children}</h3>,
  h4: ({ children }) => <h4 className="text-xl font-bold mt-6 mb-3">{children}</h4>,
  h5: ({ children }) => <h5 className="text-lg font-bold mt-4 mb-2">{children}</h5>,
  h6: ({ children }) => <h6 className="text-base font-bold mt-4 mb-2">{children}</h6>,
  p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
  a: ({ children, href }) => (
    <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="list-disc list-inside mb-4 ml-4">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside mb-4 ml-4">{children}</ol>,
  li: ({ children }) => <li className="mb-2">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-t border-gray-300" />,
  img: ({ src, alt }) => {
    if (!src) return null
    return (
      <figure className="my-8">
        <Image
          src={src}
          alt={alt || ''}
          width={800}
          height={400}
          className="rounded-lg"
        />
        {alt && <figcaption className="text-center text-sm text-gray-500 mt-2">{alt}</figcaption>}
      </figure>
    )
  },
  code: ({ className, children }) => {
    const match = /language-(\w+)/.exec(className || '')
    const isInline = !match
    return isInline ? (
      <code className="bg-gray-100 rounded px-1 py-0.5">
        {children}
      </code>
    ) : (
      <DynamicCodeBlock language={match[1]}>
        {String(children)}
      </DynamicCodeBlock>
    )
  },
  table: ({ children }) => (
    <div className="overflow-x-auto my-8">
      <table className="min-w-full divide-y divide-gray-300">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-gray-200 bg-white">{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => (
    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{children}</th>
  ),
  td: ({ children }) => <td className="px-6 py-4 text-sm text-gray-500">{children}</td>,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="line-through">{children}</del>,
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({
    where: {
      slug: params.slug,
      published: true
    }
  })

  if (!post) {
    notFound()
  }

  const blogPostSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "datePublished": post.publishedAt?.toISOString(),
    "dateModified": post.updatedAt.toISOString(),
    "author": {
      "@type": "Person",
      "name": post.author || SITE_NAME
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": "https://govideopro.com/images/logo.png"
      }
    },
    "image": post.coverImage || "https://govideopro.com/images/default-blog-image.jpg",
    "url": `https://govideopro.com/blog/${post.slug}`,
    "keywords": post.tags.join(", ")
  }

  return (
    <article className="container mx-auto px-4 py-12">
      <JsonLd data={blogPostSchema} />
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-4">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
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
              {post.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        {post.coverImage && (
          <div className="relative aspect-video mb-8 overflow-hidden rounded-lg">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={components}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  )
} 