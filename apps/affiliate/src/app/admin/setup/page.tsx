import { SiteShell } from "@/components/site-shell"
import { getAdminSnapshot } from "@/lib/repository"

export default async function AdminSetup() {
  const { site, categories } = await getAdminSnapshot()

  return (
    <SiteShell site={site} categories={categories}>
      <div className="section-head">
        <div>
          <h2>Database Setup</h2>
          <p>Run this SQL once in PostgreSQL before using the admin forms.</p>
        </div>
      </div>
      <pre className="code-block">{`psql "$DATABASE_URL" -f apps/affiliate/src/lib/schema.sql`}</pre>
      <div className="admin-panel">
        <h2>Production Environment</h2>
        <p>Configure these variables before making the site public.</p>
        <pre className="code-block">{`DATABASE_URL=postgres://...
ADMIN_USERNAME=your-admin-user
ADMIN_PASSWORD=your-strong-password
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_CONTACT_EMAIL=contact@your-domain.com`}</pre>
      </div>
      <div className="notice">
        上线后这一步可以放进部署脚本或迁移流程。2.0 的后台不会再依赖 Medusa。
      </div>
    </SiteShell>
  )
}
