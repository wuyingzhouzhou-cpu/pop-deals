"use server"

import { importAffiliateWorkbook } from "@/lib/import-workbook"
import { revalidateAdmin } from "./shared"

export async function importWorkbookAction(formData: FormData) {
  const file = formData.get("file")

  if (!(file instanceof File) || !file.name) {
    return {
      ok: false,
      message: "Please choose an Excel file.",
      result: null,
    }
  }

  const result = await importAffiliateWorkbook(file)

  if (result.errors.length > 0) {
    return {
      ok: false,
      message: "Import validation failed.",
      result,
    }
  }

  revalidateAdmin()

  return {
    ok: true,
    message: "Import completed.",
    result,
  }
}
