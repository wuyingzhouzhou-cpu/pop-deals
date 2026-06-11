import { revalidatePath } from "next/cache"

export function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim()
}

export function numberValue(formData: FormData, key: string) {
  const parsed = Number(value(formData, key))
  return Number.isFinite(parsed) ? parsed : 0
}

export function listValue(formData: FormData, key: string) {
  return value(formData, key)
    .split(/[,\n]/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
}

export function revalidateAdmin() {
  revalidatePath("/")
  revalidatePath("/admin")
  revalidatePath("/admin/sites")
  revalidatePath("/admin/categories")
  revalidatePath("/admin/products")
  revalidatePath("/admin/blog")
  revalidatePath("/admin/import")
  revalidatePath("/admin/reports")
}
