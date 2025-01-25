import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { SITE_NAME } from '@/lib/constants'
import { BlogList } from '@/components/blog-list'

export const metadata: Metadata = {
  title: `Blog | ${SITE_NAME}`,
  description: `Read the latest articles about video production, live events, and corporate communications from ${SITE_NAME}.`,
  openGraph: {
    title: `Blog | ${SITE_NAME}`,
    description: `Read the latest articles about video production, live events, and corporate communications from ${SITE_NAME}.`,
    url: 'https://govideopro.com/blog',
    siteName: SITE_NAME,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Blog | ${SITE_NAME}`,
    description: `Read the latest articles about video production, live events, and corporate communications from ${SITE_NAME}.`,
  },
}

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: {
      published: true
    },
    orderBy: {
      publishedAt: 'desc'
    }
  })

  return <BlogList posts={posts} />
} 