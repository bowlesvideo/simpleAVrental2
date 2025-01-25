import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import { prisma } from '@/lib/prisma'
import { SITE_NAME } from '@/lib/constants'
import { JsonLd } from '@/components/json-ld'

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

export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogPost(params.slug)

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.coverImage,
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
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://govideopro.com/blog/${post.slug}`
    },
    "keywords": post.tags.join(", ")
  }

  return (
    <>
      <JsonLd data={articleSchema} />
      <article className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <Link href="/blog" className="hover:text-blue-600">
                ← Back to Blog
              </Link>
              {post.publishedAt && (
                <time dateTime={post.publishedAt.toISOString()}>
                  {format(post.publishedAt, 'MMMM d, yyyy')}
                </time>
              )}
              {post.author && (
                <span>by {post.author}</span>
              )}
            </div>
            
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            
            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
            )}

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {post.coverImage && (
              <div className="relative aspect-video overflow-hidden rounded-lg mb-8">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </header>

          <div className="prose prose-lg max-w-none">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </div>
      </article>
    </>
  )
} 