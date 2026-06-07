"use client"

import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { FormEvent, useState } from "react"
import { MagnifyingGlass } from "@medusajs/icons"

export default function SearchBox() {
  const [keyword, setKeyword] = useState("")
  const router = useRouter()
  const { countryCode } = useParams()

  const handleSearch = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()

    if (!keyword.trim()) return

    router.push(`/${countryCode}/store?q=${encodeURIComponent(keyword)}`)
  }

  return (
    <form
      onSubmit={handleSearch}
      className="relative w-full max-w-[520px]"
      role="search"
    >
      <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
      <input
        type="search"
        value={keyword}
        placeholder="Search deals, stores, brands"
        className="h-10 w-full rounded border border-[#cfd4dc] bg-white pl-9 pr-3 text-small-regular text-[#111827] outline-none transition placeholder:text-[#98a2b3] focus:border-[#1769aa] focus:ring-2 focus:ring-[#d9ecff]"
        onChange={(e) => setKeyword(e.target.value)}
      />
    </form>
  )
}
