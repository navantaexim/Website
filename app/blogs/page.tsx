import Link from 'next/link'
import { getAllBlogs } from '@/lib/blogs'

export default async function BlogsPage() {
  const blogs = await getAllBlogs()

  return (
    <div className="max-w-5xl mx-auto py-20 px-4">
      <h1 className="text-4xl font-bold mb-10">All Resources</h1>

      <div className="space-y-6">
        {blogs.map((blog) => (
          <div key={blog.slug} className="p-6 border rounded-xl">
            <Link
              href={`/blogs/${blog.slug}`}
              className="text-2xl text-primary font-semibold hover:underline"
            >
              {blog.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
