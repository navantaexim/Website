import { getBlogContent } from '@/lib/blogs'
// export const dynamic = "force-dynamic";

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  // const slug = params.slug
  const { slug } = await params

  console.log('Slug received:', slug)

  const { content, title } = await getBlogContent(slug)

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <article
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: content }}
      />

    </div>
  )
}
