"use server"

import {
  createBlogPost,
  deleteBlogPost,
  updateBlogPostById,
} from "@/lib/repository"
import { revalidateAdmin, value } from "./shared"

function postStatus(formData: FormData) {
  return (value(formData, "status") || "published") as "draft" | "published"
}

export async function createBlogPostAction(formData: FormData) {
  await createBlogPost({
    siteId: value(formData, "site_id"),
    title: value(formData, "title"),
    slug: value(formData, "slug"),
    excerpt: value(formData, "excerpt"),
    body: value(formData, "body"),
    seoTitle: value(formData, "seo_title"),
    seoDescription: value(formData, "seo_description"),
    sourceTitle: value(formData, "source_title"),
    sourceUrl: value(formData, "source_url"),
    sourceAuthor: value(formData, "source_author"),
    sourceLicense: value(formData, "source_license"),
    sourceLicenseUrl: value(formData, "source_license_url"),
    status: postStatus(formData),
  })

  revalidateAdmin()
}

export async function updateBlogPostAction(formData: FormData) {
  await updateBlogPostById(value(formData, "id"), {
    siteId: value(formData, "site_id"),
    title: value(formData, "title"),
    slug: value(formData, "slug"),
    excerpt: value(formData, "excerpt"),
    body: value(formData, "body"),
    seoTitle: value(formData, "seo_title"),
    seoDescription: value(formData, "seo_description"),
    sourceTitle: value(formData, "source_title"),
    sourceUrl: value(formData, "source_url"),
    sourceAuthor: value(formData, "source_author"),
    sourceLicense: value(formData, "source_license"),
    sourceLicenseUrl: value(formData, "source_license_url"),
    status: postStatus(formData),
  })

  revalidateAdmin()
}

export async function deleteBlogPostAction(formData: FormData) {
  await deleteBlogPost(value(formData, "id"))

  revalidateAdmin()
}
