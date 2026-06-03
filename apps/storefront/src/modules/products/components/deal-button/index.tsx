"use client"

import { useCallback } from "react"

const AFFILIATE_KEYS = [
  "affiliate_aliexpress",
  "affiliate_shopee",
  "affiliate_lazada",
  "affiliate_tiktok",
  "affiliate_shein",
  "affiliate_trip",
]

export default function DealButton({
  productId,
  productTitle,
  metadata,
  handle,
  isCard = false,
}: {
  productId: string
  productTitle: string
  metadata?: Record<string, unknown> | null
  handle?: string | null
  isCard?: boolean
}) {
  const links: { source: string; url: string }[] = []

  if (metadata) {
    for (const key of AFFILIATE_KEYS) {
      const url = metadata[key]
      if (typeof url === "string" && url) {
        links.push({
          source: key.replace("affiliate_", ""),
          url,
        })
      }
    }
  }

  const trackAndGo = useCallback(
    async (url: string, source: string) => {
      try {
        await fetch("/store/affiliate/click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: productId,
            product_title: productTitle,
            affiliate_url: url,
            source,
          }),
        })
      } catch {
        // silently fail – don't block the redirect
      }
      window.open(url, "_blank", "noopener,noreferrer")
    },
    [productId, productTitle]
  )

  if (links.length === 0) {
    if (isCard) {
      if (!handle) return null
      return (
        <a
          href={`/products/${handle}`}
          className="block rounded-full bg-[#0b65c2] px-5 py-3 text-center text-base-semi text-white transition hover:bg-[#084b90]"
        >
          Buy Now
        </a>
      )
    }
    // On product detail page, when no affiliate links exist, show a placeholder disabled button
    return (
      <button
        disabled
        className="block w-full cursor-not-allowed rounded-full bg-[#d0e5f2] px-5 py-3 text-center text-base-semi text-[#0b65c2]/60"
      >
        Buy Now (Deals Coming Soon)
      </button>
    )
  }

  const primary = links[0]
  const extra = links.slice(1)

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        onClick={() => trackAndGo(primary.url, primary.source)}
        className="rounded-full bg-[#0b65c2] px-4 py-2.5 text-center text-small-semi text-white transition hover:bg-[#084b90]"
      >
        Buy Now on {primary.source}
      </button>
      {extra.length > 0 && (
        <div className="flex gap-1">
          {extra.map((l) => (
            <button
              key={l.source}
              onClick={() => trackAndGo(l.url, l.source)}
              className="rounded-full border border-[#cfd9e3] px-3 py-2 text-small-semi transition hover:border-[#0b65c2] hover:text-[#0b65c2]"
            >
              {l.source}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
