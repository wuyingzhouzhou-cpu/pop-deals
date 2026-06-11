"use server"

import {
  createProduct,
  deleteProduct,
  updateProductById,
  updateProductStatus,
} from "@/lib/repository"
import { revalidateAdmin, value } from "./shared"

function productStatus(formData: FormData) {
  return (value(formData, "status") || "published") as
    | "draft"
    | "published"
    | "disabled"
}

export async function createProductAction(formData: FormData) {
  await createProduct({
    siteId: value(formData, "site_id"),
    categoryId: value(formData, "category_id"),
    title: value(formData, "title"),
    slug: value(formData, "slug"),
    description: value(formData, "description"),
    imageUrl: value(formData, "image_url"),
    platform: value(formData, "platform"),
    platformTitle: value(formData, "platform_title"),
    country: value(formData, "country") || "US",
    priceText: value(formData, "price_text"),
    affiliateUrl: value(formData, "affiliate_url"),
    affiliateId: value(formData, "affiliate_id"),
    accountUser: value(formData, "account_user"),
    creatorUsername: value(formData, "creator_username"),
    status: productStatus(formData),
  })

  revalidateAdmin()
}

export async function updateProductAction(formData: FormData) {
  await updateProductById(value(formData, "id"), {
    siteId: value(formData, "site_id"),
    categoryId: value(formData, "category_id"),
    title: value(formData, "title"),
    slug: value(formData, "slug"),
    description: value(formData, "description"),
    imageUrl: value(formData, "image_url"),
    platform: value(formData, "platform"),
    platformTitle: value(formData, "platform_title"),
    country: value(formData, "country") || "US",
    priceText: value(formData, "price_text"),
    affiliateUrl: value(formData, "affiliate_url"),
    affiliateId: value(formData, "affiliate_id"),
    accountUser: value(formData, "account_user"),
    creatorUsername: value(formData, "creator_username"),
    status: productStatus(formData),
  })

  revalidateAdmin()
}

export async function updateProductStatusAction(formData: FormData) {
  await updateProductStatus(value(formData, "id"), productStatus(formData))

  revalidateAdmin()
}

export async function deleteProductAction(formData: FormData) {
  await deleteProduct(value(formData, "id"))

  revalidateAdmin()
}
