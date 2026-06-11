"use server"

import { createSite, updateSiteById } from "@/lib/repository"
import { listValue, revalidateAdmin, value } from "./shared"

export async function createSiteAction(formData: FormData) {
  await createSite({
    name: value(formData, "name"),
    domain: value(formData, "domain"),
    aliasDomains: listValue(formData, "alias_domains"),
    locale: value(formData, "locale") || "en-US",
    country: value(formData, "country") || "US",
    currency: value(formData, "currency") || "USD",
    description: value(formData, "description"),
    logoUrl: value(formData, "logo_url"),
    themeColor: value(formData, "theme_color"),
    seoTitle: value(formData, "seo_title"),
    seoDescription: value(formData, "seo_description"),
  })

  revalidateAdmin()
}

export async function updateSiteAction(formData: FormData) {
  await updateSiteById(value(formData, "id"), {
    name: value(formData, "name"),
    domain: value(formData, "domain"),
    aliasDomains: listValue(formData, "alias_domains"),
    locale: value(formData, "locale") || "en-US",
    country: value(formData, "country") || "US",
    currency: value(formData, "currency") || "USD",
    description: value(formData, "description"),
    logoUrl: value(formData, "logo_url"),
    themeColor: value(formData, "theme_color"),
    seoTitle: value(formData, "seo_title"),
    seoDescription: value(formData, "seo_description"),
  })

  revalidateAdmin()
}
