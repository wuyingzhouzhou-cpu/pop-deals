import "server-only"

import { createBlogPost } from "@/lib/repository"
import { slugify } from "@/lib/repositories/utils"
import { decideCollectorLicense } from "./license"
import { extractArticleFromHtml } from "./html"

export type CollectCcSourceInput = {
  siteId: string
  sourceUrl: string
  titleOverride: string
  authorOverride: string
  minWords: number
  status: "draft" | "published"
}

export type CollectCcSourceResult = {
  ok: boolean
  message: string
  run: {
    blogPostId: string
    sourceUrl: string
    status: "collected" | "rejected"
    message: string
    title: string
    author: string
    license: string
    licenseUrl: string
    wordCount: number
  }
  article: null | {
    title: string
    author: string
    license: string
    licenseUrl: string
    wordCount: number
    slug: string
  }
}

export async function collectCcSource(
  input: CollectCcSourceInput
): Promise<CollectCcSourceResult> {
  const response = await fetch(input.sourceUrl, {
    headers: {
      "User-Agent": "AffiliateCCSourceCollector/1.0",
    },
  })

  if (!response.ok) {
    return blocked(input.sourceUrl, `Source returned HTTP ${response.status}.`)
  }

  const html = await response.text()
  const extracted = extractArticleFromHtml(html)
  const license = decideCollectorLicense(extracted.licenseUrls, html)
  const title = input.titleOverride || extracted.title
  const author = input.authorOverride || extracted.author
  const minWords = Math.max(input.minWords || 1800, 1800)

  if (!license.allowed) {
    return blocked(input.sourceUrl, license.reason, {
      title,
      author,
      license: license.license,
      licenseUrl: license.licenseUrl,
      wordCount: extracted.wordCount,
    })
  }

  if (!title) {
    return blocked(input.sourceUrl, "Article title is required for attribution and SEO.")
  }

  if (!author) {
    return blocked(input.sourceUrl, "Source author is required for attribution.", {
      title,
      wordCount: extracted.wordCount,
      license: license.license,
      licenseUrl: license.licenseUrl,
    })
  }

  if (!license.licenseUrl) {
    return blocked(
      input.sourceUrl,
      "License URL is required before this source can be collected.",
      {
        title,
        author,
        license: license.license,
        wordCount: extracted.wordCount,
      }
    )
  }

  if (extracted.wordCount < minWords) {
    return blocked(
      input.sourceUrl,
      `Article is too short: ${extracted.wordCount} words. Minimum is ${minWords}.`
    )
  }

  const slug = slugify(title)

  const post = await createBlogPost({
    siteId: input.siteId,
    title,
    slug,
    excerpt: buildExcerpt(extracted.body),
    body: extracted.body,
    seoTitle: title,
    seoDescription: buildExcerpt(extracted.body),
    sourceTitle: extracted.title || title,
    sourceUrl: input.sourceUrl,
    sourceAuthor: author,
    sourceLicense: license.license,
    sourceLicenseUrl: license.licenseUrl,
    status: input.status,
  })

  return {
    ok: true,
    message: "CC source collected and saved.",
    run: {
      blogPostId: post?.id || "",
      sourceUrl: input.sourceUrl,
      status: "collected",
      message: "CC source collected and saved.",
      title,
      author,
      license: license.license,
      licenseUrl: license.licenseUrl,
      wordCount: extracted.wordCount,
    },
    article: {
      title,
      author,
      license: license.license,
      licenseUrl: license.licenseUrl,
      wordCount: extracted.wordCount,
      slug,
    },
  }
}

function blocked(
  sourceUrl: string,
  message: string,
  run?: Partial<CollectCcSourceResult["run"]>
): CollectCcSourceResult {
  return {
    ok: false,
    message,
    run: {
      blogPostId: "",
      sourceUrl,
      status: "rejected",
      message,
      title: run?.title || "",
      author: run?.author || "",
      license: run?.license || "",
      licenseUrl: run?.licenseUrl || "",
      wordCount: run?.wordCount || 0,
    },
    article: null,
  }
}

function buildExcerpt(body: string) {
  return body
    .replace(/^##\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220)
}
