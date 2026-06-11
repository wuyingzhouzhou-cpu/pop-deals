import { NextResponse } from "next/server"
import { importAffiliateWorkbook } from "@/lib/import-workbook"

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File) || !file.name) {
    return NextResponse.json(
      { ok: false, message: "file is required" },
      { status: 400 }
    )
  }

  const result = await importAffiliateWorkbook(file)

  if (result.errors.length > 0) {
    return NextResponse.json(
      { ok: false, message: "Import validation failed.", result },
      { status: 422 }
    )
  }

  return NextResponse.json({
    ok: true,
    message: "Import completed.",
    result,
  })
}
