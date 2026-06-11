import { LegalPage } from "@/components/legal-page"
import { SiteShell } from "@/components/site-shell"
import { getSiteSnapshot } from "@/lib/repository"

export default async function ContactPage() {
  const { site, categories } = await getSiteSnapshot()
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@example.com"

  return (
    <SiteShell site={site} categories={categories}>
      <LegalPage
        eyebrow="Contact"
        title="Contact"
        intro="Questions, corrections, partnership notes, and content requests can be sent by email."
        sections={[
          {
            title: "Email",
            body: email,
          },
          {
            title: "Content corrections",
            body: "If you find a product price, store link, license credit, or article detail that needs correction, please include the page URL and a short description of the issue.",
          },
          {
            title: "Affiliate and merchant inquiries",
            body: "Merchants and affiliate networks can contact us with program details, product feeds, tracking requirements, and compliance notes.",
          },
        ]}
      />
    </SiteShell>
  )
}
