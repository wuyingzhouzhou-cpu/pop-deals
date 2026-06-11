import "server-only"
import { headers } from "next/headers"
import { hasDatabase, query } from "../db"
import { demoSite } from "../mock-data"
import type { Site } from "../types"
import { siteFromRow } from "./mappers"
import { assertDatabase, normalizeHost } from "./utils"

export async function getCurrentSite(): Promise<Site> {
  const host = normalizeHost((await headers()).get("host"))

  if (!hasDatabase()) {
    return { ...demoSite, domain: host }
  }

  const rows = await query<any>(
    `select *
     from affiliate_sites
     where domain = $1 or $1 = any(alias_domains)
     limit 1`,
    [host]
  )

  if (rows[0]) {
    return siteFromRow(rows[0])
  }

  const fallback = await query<any>(
    `select *
     from affiliate_sites
     order by created_at asc
     limit 1`
  )

  if (!fallback[0]) {
    return { ...demoSite, domain: host }
  }

  return siteFromRow(fallback[0])
}

export async function listSites() {
  const rows = await query<any>(
    `select *
     from affiliate_sites
     order by created_at desc`
  )

  return rows.map(siteFromRow)
}

export async function getSiteById(id: string) {
  const rows = await query<any>(
    `select *
     from affiliate_sites
     where id = $1
     limit 1`,
    [id]
  )

  return rows[0] ? siteFromRow(rows[0]) : null
}

export async function createSite(input: {
  name: string
  domain: string
  aliasDomains: string[]
  locale: string
  country: string
  currency: string
  description: string
  logoUrl: string
  themeColor: string
  seoTitle: string
  seoDescription: string
}) {
  assertDatabase()

  await query(
    `insert into affiliate_sites
       (
        name, domain, alias_domains, locale, country, currency, description,
        logo_url, theme_color, seo_title, seo_description
       )
     values ($1, $2, $3, $4, $5, $6, $7, nullif($8, ''), nullif($9, ''), nullif($10, ''), nullif($11, ''))
     on conflict (domain) do update set
       name = excluded.name,
       alias_domains = excluded.alias_domains,
       locale = excluded.locale,
       country = excluded.country,
       currency = excluded.currency,
       description = excluded.description,
       logo_url = excluded.logo_url,
       theme_color = excluded.theme_color,
       seo_title = excluded.seo_title,
       seo_description = excluded.seo_description,
       updated_at = now()`,
    [
      input.name,
      input.domain.toLowerCase(),
      input.aliasDomains,
      input.locale,
      input.country.toUpperCase(),
      input.currency.toUpperCase(),
      input.description,
      input.logoUrl,
      input.themeColor,
      input.seoTitle,
      input.seoDescription,
    ]
  )
}

export async function updateSiteById(
  id: string,
  input: {
    name: string
    domain: string
    aliasDomains: string[]
    locale: string
    country: string
    currency: string
    description: string
    logoUrl: string
    themeColor: string
    seoTitle: string
    seoDescription: string
  }
) {
  assertDatabase()

  await query(
    `update affiliate_sites
     set
       name = $2,
       domain = $3,
       alias_domains = $4,
       locale = $5,
       country = $6,
       currency = $7,
       description = $8,
       logo_url = nullif($9, ''),
       theme_color = nullif($10, ''),
       seo_title = nullif($11, ''),
       seo_description = nullif($12, ''),
       updated_at = now()
     where id = $1`,
    [
      id,
      input.name,
      input.domain.toLowerCase(),
      input.aliasDomains,
      input.locale,
      input.country.toUpperCase(),
      input.currency.toUpperCase(),
      input.description,
      input.logoUrl,
      input.themeColor,
      input.seoTitle,
      input.seoDescription,
    ]
  )
}
