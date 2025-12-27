import { getBlogContent } from '@/lib/blogs'
import BlogClientEnhancements from '@/components/BlogClientEnhancements'

export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  // ✅ REQUIRED in Next.js 16
  const { slug } = await params

  const { content, title } = await getBlogContent(slug)

  return (
    <>
      <BlogClientEnhancements />

      <div className="w-full">
        <article
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </>
  )
}
