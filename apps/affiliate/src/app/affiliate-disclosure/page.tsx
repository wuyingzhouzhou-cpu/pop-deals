import { LegalPage } from "@/components/legal-page"
import { SiteShell } from "@/components/site-shell"
import { getSiteSnapshot } from "@/lib/repository"

export default async function AffiliateDisclosurePage() {
  const { site, categories } = await getSiteSnapshot()

  return (
    <SiteShell site={site} categories={categories}>
      <LegalPage
        eyebrow="Disclosure"
        title="Affiliate Disclosure"
        intro="This website uses affiliate links. We may earn a commission when readers click a link and complete a qualifying purchase."
        sections={[
          {
            title: "How affiliate links work",
            body: "Some product links send readers to third-party stores, marketplaces, or affiliate network tracking URLs. If you purchase through those links, we may receive compensation at no extra cost to you.",
          },
          {
            title: "Editorial approach",
            body: "Affiliate relationships may affect which offers are available to us, but our pages should still explain product fit, store context, pricing notes, and practical buying considerations.",
          },
          {
            title: "Merchant responsibility",
            body: "Final prices, discounts, availability, delivery, returns, and warranties are controlled by the merchant. Please review the merchant page before purchasing.",
          },
          {
            title: "Questions",
            body: "If you have questions about a link, product placement, or affiliate relationship, contact us through the Contact page.",
          },
        ]}
      />
    </SiteShell>
  )
}
