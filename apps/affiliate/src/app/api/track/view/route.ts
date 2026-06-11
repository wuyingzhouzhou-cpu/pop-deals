import { NextResponse } from "next/server"
import { recordProductView } from "@/lib/repository"

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const productId = String(body.product_id || "")

  if (!productId) {
    return NextResponse.json({ error: "product_id is required" }, { status: 400 })
  }

  await recordProductView(productId)

  return NextResponse.json({ ok: true })
}
