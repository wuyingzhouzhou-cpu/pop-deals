import "server-only"
import { query } from "../db"
import { postFromRow } from "./mappers"
import { assertDatabase, slugify } from "./utils"

export async function listPublishedPostsBySite(siteId: string) {
  const rows = await query<any>(
    `select *
     from affiliate_blog_posts
     where site_id = $1 and status = 'published'
     order by published_at desc
     limit 10`,
    [siteId]
  )

  return rows.map(postFromRow)
}

export async function listAdminPostsBySite(siteId: string) {
  const rows = await query<any>(
    `select *
     from affiliate_blog_posts
     where site_id = $1
     order by created_at desc`,
    [siteId]
  )

  return rows.map(postFromRow)
}

export async function getPostBySlugForSite(siteId: string, slug: string) {
  const rows = await query<any>(
    `select *
     from affiliate_blog_posts
     where site_id = $1 and slug = $2 and status = 'published'
     limit 1`,
    [siteId, slug]
  )

  return rows[0] ? postFromRow(rows[0]) : null
}

export async function getAdminPostByIdForSite(siteId: string, id: string) {
  const rows = await query<any>(
    `select *
     from affiliate_blog_posts
     where site_id = $1 and id = $2
     limit 1`,
    [siteId, id]
  )

  return rows[0] ? postFromRow(rows[0]) : null
}

export async function createBlogPost(input: {
  siteId: string
  title: string
  slug: string
  excerpt: string
  body: string
  seoTitle: string
  seoDescription: string
  sourceTitle: string
  sourceUrl: string
  sourceAuthor: string
  sourceLicense: string
  sourceLicenseUrl: string
  status: "draft" | "published"
}) {
  assertDatabase()

  const rows = await query<any>(
    `insert into affiliate_blog_posts
       (
        site_id, title, slug, excerpt, body, seo_title, seo_description,
        source_title, source_url, source_author, source_license,
        source_license_url, status, published_at
       )
     values (
        $1, $2, $3, $4, $5, nullif($6, ''), nullif($7, ''),
        nullif($8, ''), nullif($9, ''), nullif($10, ''), nullif($11, ''),
        nullif($12, ''), $13, case when $13 = 'published' then now() else null end
     )
     on conflict (site_id, slug) do update set
       title = excluded.title,
       excerpt = excluded.excerpt,
       body = excluded.body,
       seo_title = excluded.seo_title,
       seo_description = excluded.seo_description,
       source_title = excluded.source_title,
       source_url = excluded.source_url,
       source_author = excluded.source_author,
       source_license = excluded.source_license,
       source_license_url = excluded.source_license_url,
       status = excluded.status,
       published_at = case
         when excluded.status = 'published'
         then coalesce(affiliate_blog_posts.published_at, now())
         else affiliate_blog_posts.published_at
       end,
       updated_at = now()
     returning *`,
    [
      input.siteId,
      input.title,
      input.slug || slugify(input.title),
      input.excerpt,
      input.body,
      input.seoTitle,
      input.seoDescription,
      input.sourceTitle,
      input.sourceUrl,
      input.sourceAuthor,
      input.sourceLicense,
      input.sourceLicenseUrl,
      input.status,
    ]
  )

  return rows[0] ? postFromRow(rows[0]) : null
}

export async function updateBlogPostById(
  id: string,
  input: {
    siteId: string
    title: string
    slug: string
    excerpt: string
    body: string
    seoTitle: string
    seoDescription: string
    sourceTitle: string
    sourceUrl: string
    sourceAuthor: string
    sourceLicense: string
    sourceLicenseUrl: string
    status: "draft" | "published"
  }
) {
  assertDatabase()

  await query(
    `update affiliate_blog_posts
     set
       title = $3,
       slug = $4,
       excerpt = $5,
       body = $6,
       seo_title = nullif($7, ''),
       seo_description = nullif($8, ''),
       source_title = nullif($9, ''),
       source_url = nullif($10, ''),
       source_author = nullif($11, ''),
       source_license = nullif($12, ''),
       source_license_url = nullif($13, ''),
       status = $14,
       published_at = case
         when $14 = 'published' then coalesce(published_at, now())
         else published_at
       end,
       updated_at = now()
     where id = $1 and site_id = $2`,
    [
      id,
      input.siteId,
      input.title,
      input.slug || slugify(input.title),
      input.excerpt,
      input.body,
      input.seoTitle,
      input.seoDescription,
      input.sourceTitle,
      input.sourceUrl,
      input.sourceAuthor,
      input.sourceLicense,
      input.sourceLicenseUrl,
      input.status,
    ]
  )
}

export async function deleteBlogPost(id: string) {
  assertDatabase()

  await query(`delete from affiliate_blog_posts where id = $1`, [id])
}
