"use client"

import { useEffect } from "react"

export function ProductViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    const key = `affiliate-view:${productId}`

    if (sessionStorage.getItem(key)) {
      return
    }

    sessionStorage.setItem(key, "1")

    void fetch("/api/track/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
      keepalive: true,
    }).catch(() => undefined)
  }, [productId])

  return null
}
