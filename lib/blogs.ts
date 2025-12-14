import fs from 'fs'
import path from 'path'

const BLOG_DIR = path.join(process.cwd(), 'blogs')
const PUBLIC_IMG_DIR = path.join(process.cwd(), 'public/blog-images')
const CONTENT_MEDIA_DIR = path.join(BLOG_DIR, 'media')

export async function getAllBlogs() {
  if (!fs.existsSync(BLOG_DIR)) {
    return []
  }

  const files = fs.readdirSync(BLOG_DIR)
  const blogs = []
  
  // Only process HTML files
  const htmlFiles = files.filter(file => file.endsWith('.html'))

  for (const file of htmlFiles) {
      const slug = file.replace(/\.html$/, '')
      const filePath = path.join(BLOG_DIR, file)
      
      let stats
      try {
          stats = fs.statSync(filePath)
      } catch (e) {
          continue
      }

      let title = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

      // Extract title from HTML
      try {
          const content = fs.readFileSync(filePath, 'utf8')
          const titleMatch = content.match(/<title>(.*?)<\/title>/i) || content.match(/<h1>(.*?)<\/h1>/i)
          if (titleMatch && titleMatch[1]) {
              title = titleMatch[1].trim()
          }
      } catch (e) {
          // ignore error reading file
      }

      blogs.push({ 
          slug, 
          title,
          date: stats.birthtimeMs || stats.mtimeMs
      })
  }
  
  // Sort by date ascending (Oldest first)
  blogs.sort((a, b) => a.date - b.date)

  return blogs
}

export async function getBlogContent(slug: string) {
  const htmlPath = path.join(BLOG_DIR, `${slug}.html`)
  
  if (!fs.existsSync(htmlPath)) {
    return {
      title: 'Post Not Found',
      content: '<p>This blog post could not be found.</p>',
    }
  }

  let fileContent = fs.readFileSync(htmlPath, 'utf8')
  
  // Default title from slug
  let title = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  // Copy images from sources to public folder
  // We keep this logic to ensure images referenced in HTML (relative or absolute) are available in public
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

  // Rewrite HTML <img> tags to point to the public directory
  // Valid for: src="contentmedia/image1.jpg" or src="/blogs/contentmedia/image1.jpg"
  // We want to map them to: /blog-images/[slug]/image1.jpg
  fileContent = fileContent.replace(/<img[^>]+src="([^"]+)"[^>]*>/g, (match, src) => {
    // If it's already an external link, ignore
    if (src.startsWith('http') || src.startsWith('//')) return match
    
    const imageName = src.split('/').pop()
    const newPath = `/blog-images/${slug}/${imageName}`
    return match.replace(src, newPath)
  })

  // Extract Title from content
  const titleMatch = fileContent.match(/<title>(.*?)<\/title>/i) || fileContent.match(/<h1>(.*?)<\/h1>/i)
  if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim()
  }

  // Extract body content to avoid rendering full <html> in the page
  const bodyMatch = fileContent.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  if (bodyMatch) {
      fileContent = bodyMatch[1]
  }

  return {
    title,
    content: fileContent,
  }
}
