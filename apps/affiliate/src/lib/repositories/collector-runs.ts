import "server-only"
import { query } from "../db"
import { collectorRunFromRow } from "./mappers"
import { assertDatabase } from "./utils"

export async function createCollectorRun(input: {
  siteId: string
  blogPostId: string
  sourceUrl: string
  status: "collected" | "rejected"
  message: string
  title: string
  author: string
  license: string
  licenseUrl: string
  wordCount: number
}) {
  assertDatabase()

  await query(
    `insert into affiliate_collector_runs
       (
        site_id, blog_post_id, source_url, status, message, title, author,
        license, license_url, word_count
       )
     values (
        $1, nullif($2, '')::uuid, $3, $4, $5, $6, $7, $8, $9, $10
     )`,
    [
      input.siteId,
      input.blogPostId,
      input.sourceUrl,
      input.status,
      input.message,
      input.title,
      input.author,
      input.license,
      input.licenseUrl,
      input.wordCount,
    ]
  )
}

export async function listCollectorRunsBySite(siteId: string) {
  const rows = await query<any>(
    `select
       runs.*,
       posts.slug as blog_post_slug
     from affiliate_collector_runs runs
     left join affiliate_blog_posts posts on posts.id = runs.blog_post_id
     where runs.site_id = $1
     order by runs.created_at desc
     limit 50`,
    [siteId]
  )

  return rows.map(collectorRunFromRow)
}

export async function getCollectedRunBySourceUrl(siteId: string, sourceUrl: string) {
  const rows = await query<any>(
    `select
       runs.*,
       posts.slug as blog_post_slug
     from affiliate_collector_runs runs
     left join affiliate_blog_posts posts on posts.id = runs.blog_post_id
     where runs.site_id = $1
       and lower(runs.source_url) = lower($2)
       and runs.status = 'collected'
     order by runs.created_at desc
     limit 1`,
    [siteId, sourceUrl]
  )

  return rows[0] ? collectorRunFromRow(rows[0]) : null
}
