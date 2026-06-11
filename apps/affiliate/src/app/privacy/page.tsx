import { LegalPage } from "@/components/legal-page"
import { SiteShell } from "@/components/site-shell"
import { getSiteSnapshot } from "@/lib/repository"

export default async function PrivacyPage() {
  const { site, categories } = await getSiteSnapshot()

  return (
    <SiteShell site={site} categories={categories}>
      <LegalPage
        eyebrow="Privacy"
        title="Privacy Policy"
        intro="This policy explains the basic information we may collect when readers use this affiliate shopping website."
        sections={[
          {
            title: "Information we collect",
            body: "We may collect basic technical information such as page views, product clicks, referrers, browser user agents, and click identifiers used for affiliate tracking and reporting.",
          },
          {
            title: "Affiliate links",
            body: "When you click a merchant link, you may be redirected to a third-party store or affiliate network. Those third parties may collect information under their own privacy policies.",
          },
          {
            title: "Cookies and analytics",
            body: "We may use cookies, analytics tools, or affiliate tracking parameters to understand traffic, measure clicks, and improve product recommendations.",
          },
          {
            title: "Data requests",
            body: "For privacy questions or data-related requests, contact us through the Contact page and include the page URL or click details when relevant.",
          },
        ]}
      />
    </SiteShell>
  )
}
