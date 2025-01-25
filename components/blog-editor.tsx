'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { slugify } from '@/lib/utils'

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().nullable(),
  content: z.string().min(1, 'Content is required'),
  coverImage: z.string().nullable(),
  published: z.boolean().default(false),
  publishedAt: z.date().nullable(),
  author: z.string().nullable(),
  tags: z.array(z.string()).default([]),
  seoTitle: z.string().nullable(),
  seoDesc: z.string().nullable(),
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
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post?.title ?? '',
      slug: post?.slug ?? '',
      excerpt: post?.excerpt ?? '',
      content: post?.content ?? '',
      coverImage: post?.coverImage ?? '',
      published: post?.published ?? false,
      publishedAt: post?.publishedAt ?? null,
      author: post?.author ?? '',
      tags: post?.tags ?? [],
      seoTitle: post?.seoTitle ?? '',
      seoDesc: post?.seoDesc ?? ''
    }
  })

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
        <div className="flex justify-between items-center">
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

        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }: { field: InputFieldProps['field'] }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} onChange={(e) => {
                        field.onChange(e)
                        if (!form.getValues('slug')) {
                          form.setValue('slug', slugify(e.target.value))
                        }
                      }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }: { field: InputFieldProps['field'] }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      The URL-friendly version of the title
                    </FormDescription>
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
                      {...field} 
                      value={field.value || ''}
                      placeholder="Brief summary of the post" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }: { field: TextareaFieldProps['field'] }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      className="min-h-[400px] font-mono"
                      placeholder="Write your post content in markdown"
                    />
                  </FormControl>
                  <FormDescription>
                    Supports markdown formatting
                  </FormDescription>
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
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }: { field: TagsFieldProps['field'] }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      value={field.value.join(', ')}
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                        form.setValue('tags', tags)
                      }}
                      placeholder="tag1, tag2, tag3" 
                    />
                  </FormControl>
                  <FormDescription>
                    Separate tags with commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="seo" className="space-y-4">
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
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>
                        Override the default title tag
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seoDesc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>
                        Brief description for search results
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  )
} 