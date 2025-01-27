'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { slugify } from '@/lib/utils'
import Image from 'next/image'

const formSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional().default(''),
  content: z.string().min(1),
  coverImage: z.string().optional().default(''),
  published: z.boolean(),
  publishedAt: z.date().nullable(),
  author: z.string().optional().default(''),
  tags: z.array(z.string()),
  seoTitle: z.string().optional().default(''),
  seoDesc: z.string().optional().default('')
})

type FormValues = z.infer<typeof formSchema>

interface InputFieldProps {
  field: {
    value: string
    onChange: React.ChangeEventHandler<HTMLInputElement>
    onBlur: () => void
    name: string
    ref: React.Ref<HTMLInputElement>
  }
}

interface TextareaFieldProps {
  field: {
    value: string
    onChange: React.ChangeEventHandler<HTMLTextAreaElement>
    onBlur: () => void
    name: string
    ref: React.Ref<HTMLTextAreaElement>
  }
}

interface TagsFieldProps {
  field: {
    value: string[]
    onChange: (value: string[]) => void
    onBlur: () => void
    name: string
    ref: React.Ref<HTMLInputElement>
  }
}

interface BooleanFieldProps {
  field: {
    value: boolean
    onChange: (checked: boolean) => void
    onBlur: () => void
    name: string
    ref: React.Ref<HTMLInputElement>
  }
}

interface BlogEditorProps {
  post?: {
    id: string
    title: string
    slug: string
    excerpt: string | null
    content: string
    coverImage: string | null
    published: boolean
    publishedAt: Date | null
    author: string | null
    tags: string[]
    seoTitle: string | null
    seoDesc: string | null
    createdAt: Date
    updatedAt: Date
  }
}

export function BlogEditor({ post }: BlogEditorProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [mode, setMode] = useState<'content' | 'preview' | 'seo'>('content')
  
  const defaultContent = post?.content ?? ''
  const [content, setContent] = useState(defaultContent)
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post?.title ?? '',
      slug: post?.slug ?? '',
      excerpt: post?.excerpt ?? '',
      content: defaultContent,
      coverImage: post?.coverImage ?? '',
      published: post?.published ?? false,
      publishedAt: post?.publishedAt ?? null,
      author: post?.author ?? '',
      tags: post?.tags ?? [],
      seoTitle: post?.seoTitle ?? '',
      seoDesc: post?.seoDesc ?? ''
    }
  })

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'content') {
        setContent(value.content ?? '')
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  async function onSubmit(data: FormValues) {
    try {
      setIsSaving(true)
      const response = await fetch('/api/blog', {
        method: post?.id === 'new' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: post?.id === 'new' ? undefined : post?.id,
          ...data,
          excerpt: data.excerpt || null,
          coverImage: data.coverImage || null,
          author: data.author || null,
          seoTitle: data.seoTitle || null,
          seoDesc: data.seoDesc || null,
          publishedAt: data.published ? new Date() : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save post')
      }

      const savedPost = await response.json()
      toast.success('Post saved successfully')
      
      if (post?.id === 'new') {
        router.push(`/admin/blog/${savedPost.id}`)
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to save post:', error)
      toast.error('Failed to save post')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {post?.id === 'new' ? 'New Post' : 'Edit Post'}
          </h1>
          <div className="flex items-center gap-4">
            <FormField
              control={form.control}
              name="published"
              render={({ field }: { field: BooleanFieldProps['field'] }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Published</FormLabel>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            type="button"
            variant={mode === 'content' ? 'default' : 'outline'}
            onClick={() => setMode('content')}
          >
            Edit Content
          </Button>
          <Button
            type="button"
            variant={mode === 'preview' ? 'default' : 'outline'}
            onClick={() => setMode('preview')}
          >
            Preview
          </Button>
          <Button
            type="button"
            variant={mode === 'seo' ? 'default' : 'outline'}
            onClick={() => setMode('seo')}
          >
            SEO Settings
          </Button>
        </div>

        {mode === 'content' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Post title" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="post-slug" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief excerpt of the post"
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your post content in markdown..."
                      className="min-h-[400px] font-mono"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/image.jpg" 
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Author name" 
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Comma-separated tags"
                      value={field.value.join(', ')}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            .split(',')
                            .map((tag) => tag.trim())
                            .filter(Boolean)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {mode === 'preview' && (
          <Card className="min-h-[600px] bg-white">
            <CardHeader className="space-y-4">
              <CardTitle className="text-4xl font-bold">
                {form.getValues('title') || 'Post Preview'}
              </CardTitle>
              {form.getValues('excerpt') && (
                <CardDescription className="text-xl text-muted-foreground">
                  {form.getValues('excerpt')}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg prose-slate max-w-none dark:prose-invert">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>,
                    p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
                    li: ({ children }) => <li className="ml-4">{children}</li>,
                    a: ({ href, children }) => (
                      <a href={href} className="text-primary hover:underline">
                        {children}
                      </a>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic my-4">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children }) => (
                      <code className="bg-muted px-1.5 py-0.5 rounded-sm font-mono text-sm">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm">
                        {children}
                      </pre>
                    ),
                    img: ({ src, alt, title }) => {
                      if (!src) return null
                      return (
                        <div className="my-8 overflow-hidden rounded-lg">
                          <Image
                            src={src}
                            alt={alt || ''}
                            title={title || ''}
                            width={800}
                            height={400}
                            className="object-cover"
                          />
                        </div>
                      )
                    },
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}

        {mode === 'seo' && (
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize your post for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="seoTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="SEO-optimized title"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seoDesc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="SEO-optimized description"
                        className="resize-none"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}
      </form>
    </Form>
  )
} 