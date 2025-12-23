import Link from 'next/link'
import { getAllBlogs } from '@/lib/blogs'

export default async function BlogsPage() {
  const blogs = await getAllBlogs()

  return (
    <div className="max-w-5xl mx-auto py-20 px-4">
      <h1 className="text-4xl font-bold mb-10">All Resources</h1>

      <div className="space-y-6">
        {blogs.map((blog) => (
          <details key={blog.slug} className="group border rounded-xl p-6">

            <summary className="cursor-pointer text-xl font-semibold text-primary">
              {blog.title}
            </summary>

            {blog.sections.length > 0 && (
              <div className="overflow-hidden transition-all duration-300 ease-in-out group-open:max-h-[500px] max-h-0">
                <ul className="mt-4 space-y-2 pl-4">
                  {blog.sections.map((section) => (
                    <li key={section.id}>
                      <Link
                        href={`/blogs/${blog.slug}#${section.id}`}
                        className="text-slate-700 hover:text-primary transition-colors"
                      >
                        {section.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

            )}
          </details>
        ))}

      </div>
    </div>
  )
}
