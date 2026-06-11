import "server-only"
import { query } from "../db"
import { productFromRow } from "./mappers"
import { assertDatabase, slugify } from "./utils"

export async function listPublishedProductsBySite(siteId: string) {
  const rows = await query<any>(
    `select *
     from affiliate_products
     where site_id = $1 and status = 'published'
     order by view_count desc, created_at desc
     limit 24`,
    [siteId]
  )

  return rows.map(productFromRow)
}

export async function listAdminProductsBySite(siteId: string) {
  const rows = await query<any>(
    `select *
     from affiliate_products
     where site_id = $1
     order by created_at desc`,
    [siteId]
  )

  return rows.map(productFromRow)
}

export async function getProductBySlugForSite(siteId: string, slug: string) {
  const rows = await query<any>(
    `select *
     from affiliate_products
     where site_id = $1 and slug = $2 and status = 'published'
     limit 1`,
    [siteId, slug]
  )

  return rows[0] ? productFromRow(rows[0]) : null
}

export async function getAdminProductByIdForSite(siteId: string, id: string) {
  const rows = await query<any>(
    `select *
     from affiliate_products
     where site_id = $1 and id = $2
     limit 1`,
    [siteId, id]
  )

  return rows[0] ? productFromRow(rows[0]) : null
}

export async function createProduct(input: {
  siteId: string
  categoryId: string
  title: string
  slug: string
  description: string
  imageUrl: string
  platform: string
  platformTitle: string
  country: string
  priceText: string
  affiliateUrl: string
  affiliateId: string
  accountUser: string
  creatorUsername: string
  status: "draft" | "published" | "disabled"
}) {
  assertDatabase()

  await query(
    `insert into affiliate_products
       (
        site_id, category_id, title, slug, description, image_url, platform,
        platform_title, country, price_text, affiliate_url, affiliate_id,
        account_user, creator_username, status
       )
     values (
        $1, nullif($2, '')::uuid, $3, $4, $5, nullif($6, ''), $7,
        $8, $9, $10, $11, nullif($12, ''), nullif($13, ''), nullif($14, ''), $15
     )
     on conflict (site_id, slug) do update set
       category_id = excluded.category_id,
       title = excluded.title,
       description = excluded.description,
       image_url = excluded.image_url,
       platform = excluded.platform,
       platform_title = excluded.platform_title,
       country = excluded.country,
       price_text = excluded.price_text,
       affiliate_url = excluded.affiliate_url,
       affiliate_id = excluded.affiliate_id,
       account_user = excluded.account_user,
       creator_username = excluded.creator_username,
       status = excluded.status,
       updated_at = now()`,
    [
      input.siteId,
      input.categoryId,
      input.title,
      input.slug || slugify(input.title),
      input.description,
      input.imageUrl,
      input.platform,
      input.platformTitle,
      input.country.toUpperCase(),
      input.priceText,
      input.affiliateUrl,
      input.affiliateId,
      input.accountUser,
      input.creatorUsername,
      input.status,
    ]
  )
}

export async function updateProductById(
  id: string,
  input: {
    siteId: string
    categoryId: string
    title: string
    slug: string
    description: string
    imageUrl: string
    platform: string
    platformTitle: string
    country: string
    priceText: string
    affiliateUrl: string
    affiliateId: string
    accountUser: string
    creatorUsername: string
    status: "draft" | "published" | "disabled"
  }
) {
  assertDatabase()

  await query(
    `update affiliate_products
     set
       category_id = nullif($3, '')::uuid,
       title = $4,
       slug = $5,
       description = $6,
       image_url = nullif($7, ''),
       platform = $8,
       platform_title = $9,
       country = $10,
       price_text = $11,
       affiliate_url = $12,
       affiliate_id = nullif($13, ''),
       account_user = nullif($14, ''),
       creator_username = nullif($15, ''),
       status = $16,
       updated_at = now()
     where id = $1 and site_id = $2`,
    [
      id,
      input.siteId,
      input.categoryId,
      input.title,
      input.slug || slugify(input.title),
      input.description,
      input.imageUrl,
      input.platform,
      input.platformTitle,
      input.country.toUpperCase(),
      input.priceText,
      input.affiliateUrl,
      input.affiliateId,
      input.accountUser,
      input.creatorUsername,
      input.status,
    ]
  )
}

export async function updateProductStatus(
  id: string,
  status: "draft" | "published" | "disabled"
) {
  assertDatabase()

  await query(
    `update affiliate_products
     set status = $2, updated_at = now()
     where id = $1`,
    [id, status]
  )
}

export async function deleteProduct(id: string) {
  assertDatabase()

  await query(`delete from affiliate_products where id = $1`, [id])
}
