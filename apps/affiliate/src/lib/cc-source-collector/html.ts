export type ExtractedArticle = {
  title: string
  author: string
  licenseUrls: string[]
  body: string
  wordCount: number
}

export function extractArticleFromHtml(html: string): ExtractedArticle {
  const cleanHtml = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")

  const title =
    metaContent(cleanHtml, "og:title") ||
    metaContent(cleanHtml, "twitter:title") ||
    tagText(cleanHtml, "title") ||
    firstHeading(cleanHtml)
  const author =
    metaContent(cleanHtml, "author") ||
    metaContent(cleanHtml, "article:author") ||
    metaContent(cleanHtml, "dc.creator") ||
    ""
  const licenseUrls = extractLicenseUrls(cleanHtml)
  const articleHtml = articleBlock(cleanHtml)
  const body = htmlToReadableText(articleHtml)

  return {
    title: decodeEntities(title).trim(),
    author: decodeEntities(author).trim(),
    licenseUrls,
    body,
    wordCount: countWords(body),
  }
}

export function countWords(text: string) {
  const latinWords = text.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g) || []
  const cjkChars = text.match(/[\u3400-\u9fff]/g) || []

  return latinWords.length + Math.ceil(cjkChars.length / 2)
}

function metaContent(html: string, name: string) {
  const escaped = escapeRegExp(name)
  const patterns = [
    new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${escaped}["'][^>]*>`, "i"),
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) {
      return match[1]
    }
  }

  return ""
}

function tagText(html: string, tag: string) {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"))
  return match ? stripTags(match[1]) : ""
}

function firstHeading(html: string) {
  return tagText(html, "h1")
}

function extractLicenseUrls(html: string) {
  const urls = new Set<string>()
  const linkPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>[\s\S]*?<\/a>|<link[^>]+href=["']([^"']+)["'][^>]*>/gi
  let match: RegExpExecArray | null

  while ((match = linkPattern.exec(html))) {
    const href = match[1] || match[2] || ""
    if (href.toLowerCase().includes("creativecommons.org")) {
      urls.add(href)
    }
  }

  return Array.from(urls)
}

function articleBlock(html: string) {
  const article = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
  if (article?.[1]) {
    return article[1]
  }

  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
  if (main?.[1]) {
    return main[1]
  }

  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  return body?.[1] || html
}

function htmlToReadableText(html: string) {
  return html
    .replace(/<(h[1-3])[^>]*>/gi, "\n\n## ")
    .replace(/<\/h[1-3]>/gi, "\n\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<(nav|header|footer|aside)[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .split(/\n{2,}/)
    .map((block) => decodeEntities(block).replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n")
}

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, " ")
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
