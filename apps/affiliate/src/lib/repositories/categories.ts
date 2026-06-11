import "server-only"
import { query } from "../db"
import type { Category, NavSection } from "../types"
import { categoryFromRow } from "./mappers"
import { assertDatabase, slugify } from "./utils"

export async function listCategoriesBySite(siteId: string) {
  const rows = await query<any>(
    `select *
     from affiliate_categories
     where site_id = $1
     order by nav_section asc, sort_order asc, name asc`,
    [siteId]
  )

  return rows.map(categoryFromRow)
}

export async function getCategoryById(siteId: string, id: string) {
  const rows = await query<any>(
    `select *
     from affiliate_categories
     where site_id = $1 and id = $2
     limit 1`,
    [siteId, id]
  )

  return rows[0] ? categoryFromRow(rows[0]) : null
}

export function categoriesBySection(
  categories: Category[],
  section: NavSection
) {
  return categories.filter((category) => category.navSection === section)
}

export async function createCategory(input: {
  siteId: string
  parentId: string
  navSection: NavSection
  name: string
  slug: string
  description: string
  sortOrder: number
}) {
  assertDatabase()

  await query(
    `insert into affiliate_categories
       (site_id, parent_id, nav_section, name, slug, description, sort_order)
     values ($1, nullif($2, '')::uuid, $3, $4, $5, $6, $7)
     on conflict (site_id, slug) do update set
       parent_id = excluded.parent_id,
       nav_section = excluded.nav_section,
       name = excluded.name,
       description = excluded.description,
       sort_order = excluded.sort_order,
       updated_at = now()`,
    [
      input.siteId,
      input.parentId,
      input.navSection,
      input.name,
      input.slug || slugify(input.name),
      input.description,
      input.sortOrder,
    ]
  )
}

export async function updateCategoryById(
  id: string,
  input: {
    siteId: string
    parentId: string
    navSection: NavSection
    name: string
    slug: string
    description: string
    sortOrder: number
  }
) {
  assertDatabase()

  const parentId = input.parentId === id ? "" : input.parentId

  await query(
    `update affiliate_categories
     set
       parent_id = nullif($3, '')::uuid,
       nav_section = $4,
       name = $5,
       slug = $6,
       description = $7,
       sort_order = $8,
       updated_at = now()
     where id = $1 and site_id = $2`,
    [
      id,
      input.siteId,
      parentId,
      input.navSection,
      input.name,
      input.slug || slugify(input.name),
      input.description,
      input.sortOrder,
    ]
  )
}

export async function deleteCategory(id: string) {
  assertDatabase()

  await query(`delete from affiliate_categories where id = $1`, [id])
}
