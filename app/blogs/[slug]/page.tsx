import { getBlogContent } from '@/lib/blogs'
export const dynamic = "force-dynamic";

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  // const slug = params.slug
  const { slug } = await params

  console.log('Slug received:', slug)

  const { content, title } = await getBlogContent(slug)

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <article
        className="prose prose-lg prose-li:my-1 prose-ul:ml-6 prose-ol:ml-6"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
