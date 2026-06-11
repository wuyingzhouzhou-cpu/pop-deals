import { LegalPage } from "@/components/legal-page"
import { SiteShell } from "@/components/site-shell"
import { getSiteSnapshot } from "@/lib/repository"

export default async function AboutPage() {
  const { site, categories } = await getSiteSnapshot()

  return (
    <SiteShell site={site} categories={categories}>
      <LegalPage
        eyebrow="About"
        title={`About ${site.name}`}
        intro={`${site.name} is an affiliate shopping guide website that helps readers discover marketplace deals, buying guides, and practical product comparisons.`}
        sections={[
          {
            title: "What we publish",
            body: "We publish deal roundups, product guides, shopping tips, coupon notes, and educational content for readers who want to compare products before visiting a store.",
          },
          {
            title: "How we choose products",
            body: "Products may be selected by category fit, store availability, reader intent, price context, and affiliate campaign relevance. We aim to make product pages useful before a reader clicks out to a merchant.",
          },
          {
            title: "Independence",
            body: "Affiliate relationships may influence which stores are available through our links, but our content should still explain the use case, limitations, and practical buying considerations.",
          },
        ]}
      />
    </SiteShell>
  )
}
