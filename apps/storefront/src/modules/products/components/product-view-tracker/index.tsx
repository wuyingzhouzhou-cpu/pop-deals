"use client"

import { useEffect } from "react"

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

export default function ProductViewTracker({
  productId,
  productTitle,
}: {
  productId: string
  productTitle: string
}) {
  useEffect(() => {
    const storageKey = `affiliate-view:${productId}`
    const lastView = Number(sessionStorage.getItem(storageKey) || 0)
    const now = Date.now()

    if (now - lastView < 30 * 60 * 1000) {
      return
    }

    sessionStorage.setItem(storageKey, String(now))

    const viewId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${now}-${Math.random().toString(16).slice(2)}`

    fetch(`${MEDUSA_BACKEND_URL}/store/affiliate/views`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: productId,
        product_title: productTitle,
        view_id: viewId,
      }),
    }).catch(() => {})
  }, [productId, productTitle])

  return null
}
