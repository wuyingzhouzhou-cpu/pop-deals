import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const listCategories = async (query?: Record<string, unknown>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category,+metadata,+parent_category_id",
          limit,
          ...query,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields:
            "*category_children, *products,*parent_category,*parent_category.parent_category,+metadata,+parent_category_id",
          handle,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories[0])
}

export const getAffiliateCategories = (
  categories?: HttpTypes.StoreProductCategory[],
  section?: string,
  includeFallback = false
) => {
  const affiliateCategories =
    categories?.filter((category) => {
      const metadata = category.metadata as
        | Record<string, unknown>
        | null
        | undefined

      return (
        metadata?.affiliate_category === true ||
        metadata?.affiliate_category === "true" ||
        metadata?.category_type === "affiliate" ||
        metadata?.category_module === "affiliate"
      )
    }) || []

  const visibleCategories =
    affiliateCategories.length || !includeFallback
      ? affiliateCategories
      : categories || []

  return visibleCategories
    .filter((category) => {
      if (!section || !affiliateCategories.length) {
        return true
      }

      const metadata = category.metadata as
        | Record<string, unknown>
        | null
        | undefined

      return (metadata?.affiliate_nav_section || "categories") === section
    })
    .sort((a, b) => {
      const aMeta = a.metadata as Record<string, unknown> | null | undefined
      const bMeta = b.metadata as Record<string, unknown> | null | undefined
      const aOrder = Number(aMeta?.affiliate_sort_order ?? a.rank ?? 0)
      const bOrder = Number(bMeta?.affiliate_sort_order ?? b.rank ?? 0)

      if (aOrder !== bOrder) {
        return aOrder - bOrder
      }

      return String(a.name).localeCompare(String(b.name))
    })
}

export const getAffiliateCategoryLabel = (
  category: HttpTypes.StoreProductCategory
) => {
  const metadata = category.metadata as
    | Record<string, unknown>
    | null
    | undefined
  const label = metadata?.affiliate_nav_label

  return typeof label === "string" && label.trim() ? label : category.name
}
