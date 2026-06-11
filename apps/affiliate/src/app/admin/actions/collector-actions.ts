"use server"

import { collectCcSource } from "@/lib/cc-source-collector/collector"
import {
  createCollectorRun,
  getCollectedRunBySourceUrl,
} from "@/lib/repository"
import { revalidateAdmin, value } from "./shared"

const initialResult = {
  ok: false,
  message: "",
  article: null as null | {
    title: string
    author: string
    license: string
    licenseUrl: string
    wordCount: number
    slug: string
  },
}

type CollectorActionResult = typeof initialResult

export async function collectCcSourceAction(
  _state: CollectorActionResult,
  formData: FormData
) {
  const sourceUrl = value(formData, "source_url")
  const siteId = value(formData, "site_id")

  if (!isValidHttpUrl(sourceUrl)) {
    return {
      ok: false,
      message: "Please enter a valid http or https source URL.",
      article: null,
    }
  }

  const existingRun = await getCollectedRunBySourceUrl(siteId, sourceUrl)

  if (existingRun) {
    const message = "This source URL has already been collected for this site."

    await createCollectorRun({
      siteId,
      blogPostId: existingRun.blogPostId || "",
      sourceUrl,
      status: "rejected",
      message,
      title: existingRun.title,
      author: existingRun.author,
      license: existingRun.license,
      licenseUrl: existingRun.licenseUrl,
      wordCount: existingRun.wordCount,
    })

    revalidateAdmin()

    return {
      ok: false,
      message,
      article: existingRun.blogPostSlug
        ? {
            title: existingRun.title,
            author: existingRun.author,
            license: existingRun.license,
            licenseUrl: existingRun.licenseUrl,
            wordCount: existingRun.wordCount,
            slug: existingRun.blogPostSlug,
          }
        : null,
    }
  }

  const result = await collectCcSource({
    siteId,
    sourceUrl,
    titleOverride: value(formData, "title_override"),
    authorOverride: value(formData, "author_override"),
    minWords: Number(value(formData, "min_words") || 1800),
    status: (value(formData, "status") || "draft") as "draft" | "published",
  })

  await createCollectorRun({
    siteId,
    ...result.run,
  })

  if (result.ok) {
    revalidateAdmin()
  }

  return result
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}
