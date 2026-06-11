"use server"

import {
  createCategory,
  deleteCategory,
  updateCategoryById,
} from "@/lib/repository"
import type { NavSection } from "@/lib/types"
import { numberValue, revalidateAdmin, value } from "./shared"

export async function createCategoryAction(formData: FormData) {
  await createCategory({
    siteId: value(formData, "site_id"),
    parentId: value(formData, "parent_id"),
    navSection: value(formData, "nav_section") as NavSection,
    name: value(formData, "name"),
    slug: value(formData, "slug"),
    description: value(formData, "description"),
    sortOrder: numberValue(formData, "sort_order"),
  })

  revalidateAdmin()
}

export async function updateCategoryAction(formData: FormData) {
  await updateCategoryById(value(formData, "id"), {
    siteId: value(formData, "site_id"),
    parentId: value(formData, "parent_id"),
    navSection: value(formData, "nav_section") as NavSection,
    name: value(formData, "name"),
    slug: value(formData, "slug"),
    description: value(formData, "description"),
    sortOrder: numberValue(formData, "sort_order"),
  })

  revalidateAdmin()
}

export async function deleteCategoryAction(formData: FormData) {
  await deleteCategory(value(formData, "id"))

  revalidateAdmin()
}
