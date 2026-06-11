import { AdminNotice } from "@/components/admin-notice"
import { BlogPostAdminList } from "@/components/blog-post-admin-list"
import { BlogPostForm } from "@/components/blog-post-form"
import { SiteShell } from "@/components/site-shell"
import { getAdminSnapshot } from "@/lib/repository"

export default async function AdminBlog() {
  const { site, categories, posts, databaseReady } = await getAdminSnapshot()

  return (
    <SiteShell site={site} categories={categories}>
      <div className="section-head">
        <div>
          <h2>Blog & SEO</h2>
          <p>Plan buying guides, coupon guides, listicles, and comparisons.</p>
        </div>
      </div>
      <AdminNotice databaseReady={databaseReady} />
      <div className="admin-layout">
        <BlogPostForm site={site} databaseReady={databaseReady} />
        <BlogPostAdminList posts={posts} databaseReady={databaseReady} />
      </div>
    </SiteShell>
  )
}
