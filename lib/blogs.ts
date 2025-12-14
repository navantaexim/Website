import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'


const BLOG_DIR = path.join(process.cwd(), 'blogs')
const PUBLIC_IMG_DIR = path.join(process.cwd(), 'public/blog-images')
const CONTENT_MEDIA_DIR = path.join(BLOG_DIR, 'media')

export async function getAllBlogs() {
  if (!fs.existsSync(BLOG_DIR)) {
    return []
  }

  const files = fs.readdirSync(BLOG_DIR)
  const seenSlugs = new Set()
  const blogs = []

  // Prioritize files - maybe scan all and push to list
  for (const file of files) {
      if (!file.endsWith('.md') && !file.endsWith('.html')) continue

      const slug = file.replace(/\.(md|html)$/, '')
      
      if (seenSlugs.has(slug)) continue
      seenSlugs.add(slug)

      let title = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

      // Try to extract title from HTML
      if (file.endsWith('.html')) {
          try {
              const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8')
              const titleMatch = content.match(/<title>(.*?)<\/title>/i) || content.match(/<h1>(.*?)<\/h1>/i)
              if (titleMatch && titleMatch[1]) {
                  title = titleMatch[1].trim()
              }
          } catch (e) {
             // ignore
          }
      } else {
         // Try to extract title from MD frontmatter
         try {
             const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8')
             const { data } = matter(content)
             if (data.title) title = data.title
         } catch (e) {}
      }

      blogs.push({ slug, title })
  }
  
  return blogs
}

export async function getBlogContent(slug: string) {
  const mdPath = path.join(BLOG_DIR, `${slug}.md`)
  const htmlPath = path.join(BLOG_DIR, `${slug}.html`)
  
  let fileContent = ''
  let isHtml = false
  let title = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  if (fs.existsSync(mdPath)) {
      fileContent = fs.readFileSync(mdPath, 'utf8')
  } else if (fs.existsSync(htmlPath)) {
      fileContent = fs.readFileSync(htmlPath, 'utf8')
      isHtml = true
  } else {
    return {
      title: 'Post Not Found',
      content: '<p>This blog post could not be found.</p>',
    }
  }

  const imageSources = [
      path.join(BLOG_DIR, 'media', 'media'),
      CONTENT_MEDIA_DIR
  ]

  const destSlugDir = path.join(PUBLIC_IMG_DIR, slug)

  try {
    if (!fs.existsSync(destSlugDir)) {
      fs.mkdirSync(destSlugDir, { recursive: true })
    }

    imageSources.forEach(sourceDir => {
        if (fs.existsSync(sourceDir)) {
            const images = fs.readdirSync(sourceDir)
            for (const img of images) {
                const srcPath = path.join(sourceDir, img)
                const destPath = path.join(destSlugDir, img)
                if (!fs.existsSync(destPath)) {
                    fs.copyFileSync(srcPath, destPath)
                }
            }
        }
    })
  } catch (error) {
    console.error('Error copying blog images:', error)
  }

  // Rewrite HTML <img> tags
  fileContent = fileContent.replace(/<img[^>]+src="([^"]+)"[^>]*>/g, (match, src) => {
    const imageName = src.split('/').pop()
    const newPath = `/blog-images/${slug}/${imageName}`
    return match.replace(src, newPath)
  })

  if (isHtml) {
      const titleMatch = fileContent.match(/<title>(.*?)<\/title>/i) || fileContent.match(/<h1>(.*?)<\/h1>/i)
      if (titleMatch && titleMatch[1]) {
          title = titleMatch[1].trim()
      }
      const bodyMatch = fileContent.match(/<body[^>]*>([\s\S]*)<\/body>/i)
      if (bodyMatch) {
          fileContent = bodyMatch[1]
      }
      return {
          title,
          content: fileContent
      }
  }

  const { content, data } = matter(fileContent)

  const processed = await remark()
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(html, { sanitize: false })
    .process(content)

  const htmlContent = processed.toString()

  return {
    title: data.title || title,
    content: htmlContent,
  }
}
