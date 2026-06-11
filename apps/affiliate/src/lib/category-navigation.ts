import type { AffiliateProduct, Category, NavSection } from "./types"

export const navSections: Array<{ key: NavSection; label: string }> = [
  { key: "categories", label: "Categories" },
  { key: "coupons", label: "Coupons" },
  { key: "travel", label: "Travel" },
  { key: "digital_services", label: "Digital Services" },
  { key: "gaming", label: "Gaming" },
]

export function categoriesForSection(
  categories: Category[],
  section: NavSection
) {
  return categories.filter((category) => category.navSection === section)
}

export function topLevelCategories(categories: Category[]) {
  return categories.filter((category) => !category.parentId)
}

export function childCategories(categories: Category[], parentId: string) {
  return categories.filter((category) => category.parentId === parentId)
}

export function categoryBySlug(categories: Category[], slug?: string) {
  if (!slug) {
    return null
  }

  return categories.find((category) => category.slug === slug) || null
}

export function navSectionLabel(section?: string) {
  return navSections.find((item) => item.key === section)?.label || "Deals"
}

export function descendantCategoryIds(
  categories: Category[],
  categoryId: string
) {
  const ids = new Set([categoryId])
  let changed = true

  while (changed) {
    changed = false
    for (const category of categories) {
      if (category.parentId && ids.has(category.parentId) && !ids.has(category.id)) {
        ids.add(category.id)
        changed = true
      }
    }
  }

  return ids
}

export function productsForCategory(
  products: AffiliateProduct[],
  categories: Category[],
  category: Category
) {
  const ids = descendantCategoryIds(categories, category.id)

  return products.filter(
    (product) => product.categoryId && ids.has(product.categoryId)
  )
}

export function productsForSection(
  products: AffiliateProduct[],
  categories: Category[],
  section?: string
) {
  const navSection = navSections.find((item) => item.key === section)?.key

  if (!navSection) {
    return products
  }

  const ids = new Set(
    categoriesForSection(categories, navSection).map((category) => category.id)
  )

  return products.filter(
    (product) => product.categoryId && ids.has(product.categoryId)
  )
}
