"use server"

import { sdk } from "@lib/config"

export const getAffiliateProductViews = async (productIds: string[]) => {
  const ids = productIds.filter(Boolean)

  if (!ids.length) {
    return {}
  }

  return sdk.client
    .fetch<{ views: Record<string, number> }>("/store/affiliate/views", {
      method: "GET",
      query: {
        product_ids: ids.join(","),
      },
      cache: "no-store",
    })
    .then(({ views }) => views || {})
    .catch(() => ({} as Record<string, number>))
}
