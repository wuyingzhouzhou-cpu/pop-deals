import { LegalPage } from "@/components/legal-page"
import { SiteShell } from "@/components/site-shell"
import { getSiteSnapshot } from "@/lib/repository"

export default async function TermsPage() {
  const { site, categories } = await getSiteSnapshot()

  return (
    <SiteShell site={site} categories={categories}>
      <LegalPage
        eyebrow="Terms"
        title="Terms of Use"
        intro="By using this website, you agree to use the content as general shopping information and to review merchant terms before purchasing."
        sections={[
          {
            title: "Shopping information",
            body: "Product details, prices, availability, shipping terms, coupons, and store policies can change. Always confirm final details on the merchant website before buying.",
          },
          {
            title: "No merchant guarantee",
            body: "We link to third-party merchants and marketplaces, but we do not control their checkout pages, delivery, returns, warranties, or customer service.",
          },
          {
            title: "Content use",
            body: "Website content is provided for informational purposes. Do not rely on it as financial, legal, medical, or professional advice.",
          },
          {
            title: "Changes",
            body: "We may update site content, product links, policies, and these terms as the website changes.",
          },
        ]}
      />
    </SiteShell>
  )
}
