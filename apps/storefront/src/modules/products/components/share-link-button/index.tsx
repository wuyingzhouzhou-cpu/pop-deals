"use client"

import { Link, Share } from "@medusajs/icons"
import { useMemo, useState } from "react"

type ShareLinkButtonProps = {
  productHandle?: string | null
  className?: string
  compact?: boolean
}

export default function ShareLinkButton({
  productHandle,
  className = "",
  compact = false,
}: ShareLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  const label = copied ? "Copied" : compact ? "Copy" : "Copy link"
  const Icon = compact ? Link : Share

  const fallbackPath = useMemo(
    () => (productHandle ? `/products/${productHandle}` : "/store"),
    [productHandle]
  )

  const copyLink = async () => {
    const pathname = window.location.pathname
    const countryMatch = pathname.match(/^\/([^/]+)\//)
    const countryPrefix = countryMatch?.[1] ? `/${countryMatch[1]}` : ""
    const path = productHandle
      ? `${countryPrefix}/products/${productHandle}`
      : pathname
    const url = new URL(path || fallbackPath, window.location.origin).toString()

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = url
      textarea.setAttribute("readonly", "true")
      textarea.style.position = "fixed"
      textarea.style.left = "-9999px"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    }
  }

  return (
    <button
      type="button"
      onClick={copyLink}
      className={className}
      aria-label="Copy product link"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}
