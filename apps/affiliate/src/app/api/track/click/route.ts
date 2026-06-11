import { NextResponse } from "next/server"
import { getSiteSnapshot, recordProductClick } from "@/lib/repository"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const productId = url.searchParams.get("product_id") || ""
  const clickId = url.searchParams.get("click_id") || crypto.randomUUID()

  const snapshot = await getSiteSnapshot()
  const product = snapshot.products.find((item) => item.id === productId)

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  await recordProductClick(product.id, clickId, {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip"),
    userAgent: request.headers.get("user-agent"),
    referrer: request.headers.get("referer"),
  })

  return NextResponse.redirect(product.affiliateUrl)
}
