"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SearchBox() {
  const [keyword, setKeyword] = useState("")
  const router = useRouter()

  const handleSearch = () => {
    if (!keyword.trim()) return

    router.push(`/store?q=${encodeURIComponent(keyword)}`)
  }

  return (
    <input
      type="text"
      value={keyword}
      placeholder="Search products..."
      className="
        border
        rounded-lg
        px-4
        py-2
        w-64
        text-sm
      "
      onChange={(e) => setKeyword(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSearch()
        }
      }}
    />
  )
}
