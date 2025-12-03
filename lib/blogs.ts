import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'


const BLOG_DIR = path.join(process.cwd(), 'blogs')
const PUBLIC_IMG_DIR = path.join(process.cwd(), 'public/blog-images')

export async function getAllBlogs() {
  const files = fs.readdirSync(BLOG_DIR)

  return files
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const slug = file.replace('.md', '')
      return {
        slug,
        title: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      }
    })
}

export async function getBlogContent(slug: string) {
  const mdPath = path.join(BLOG_DIR, `${slug}.md`)
  let file = fs.readFileSync(mdPath, 'utf8')

  // Copy images from blogs/media/media → public/blog-images/<slug>/
  const mediaDir = path.join(BLOG_DIR, 'media', 'media')

  const destSlugDir = path.join(PUBLIC_IMG_DIR, slug)
  if (!fs.existsSync(destSlugDir)) {
    fs.mkdirSync(destSlugDir, { recursive: true })
  }

  if (fs.existsSync(mediaDir)) {
    const images = fs.readdirSync(mediaDir)
    for (const img of images) {
      const srcPath = path.join(mediaDir, img)
      const destPath = path.join(destSlugDir, img)
      fs.copyFileSync(srcPath, destPath)
    }
  }

  // Rewrite HTML <img> tags
  file = file.replace(/<img[^>]+src="([^"]+)"[^>]*>/g, (match, src) => {
    const imageName = src.split('/').pop()
    const newPath = `/blog-images/${slug}/${imageName}`
    return match.replace(src, newPath)
  })

  // Convert markdown → HTML but KEEP <img> tags
  const { content, data } = matter(file)

const processed = await remark()
  .use(remarkGfm)
  .use(remarkBreaks)
  .use(html, { sanitize: false })
  .process(content)

const htmlContent = processed.toString()


  return {
    title: data.title || slug,
    content: htmlContent,
  }
}
