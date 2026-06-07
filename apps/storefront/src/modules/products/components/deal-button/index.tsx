"use client"

import { AffiliateLink, getAffiliateLinks } from "@lib/util/affiliate"
import { useCallback } from "react"

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

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
  const links = getAffiliateLinks(metadata)

  const trackAndGo = useCallback(
    async (link: AffiliateLink) => {
      const clickId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`

      try {
        await fetch(`${MEDUSA_BACKEND_URL}/store/affiliate/click`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: productId,
            product_title: productTitle,
            affiliate_url: link.url,
            source: link.source,
            platform_title: link.label,
            affiliate_id: link.affiliateId,
            account_user: link.accountUser,
            creator_username: link.creatorUsername,
            click_id: clickId,
          }),
        })
      } catch {
        // silently fail – don't block the redirect
      }
      window.open(link.url, "_blank", "noopener,noreferrer")
    },
    [productId, productTitle]
  )

  if (links.length === 0) {
    if (isCard) {
      if (!handle) return null
      return (
        <a
          href={`/products/${handle}`}
          className="block rounded bg-[#1769aa] px-5 py-3 text-center text-base-semi text-white transition hover:bg-[#125384]"
        >
          View Deal
        </a>
      )
    }
    return (
      <button
        disabled
        className="block h-12 w-full cursor-not-allowed rounded bg-[#d9ecff] px-5 text-center text-base-semi text-[#1769aa]/70"
      >
        Buy Now
      </button>
    )
  }

  const primary = links[0]
  const extra = links.slice(1)

  return (
    <div className="grid gap-2">
      <button
        onClick={() => trackAndGo(primary)}
        className="h-12 rounded bg-[#1769aa] px-4 text-center text-base-semi text-white transition hover:bg-[#125384]"
      >
        Buy Now at {primary.label}
      </button>
      {extra.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {extra.map((l) => (
            <button
              key={l.source}
              onClick={() => trackAndGo(l)}
              className="rounded border border-[#d7dde5] px-3 py-2 text-small-semi text-[#344054] transition hover:border-[#1769aa] hover:bg-[#eef6ff] hover:text-[#1769aa]"
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
