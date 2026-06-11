"use client"

import { useState } from "react"

export function CopyLinkButton({
  href,
  className = "button secondary",
}: {
  href: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    const url = new URL(href, window.location.origin).toString()

    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button className={className} type="button" onClick={copyLink}>
      {copied ? "Copied" : "Copy Link"}
    </button>
  )
}
