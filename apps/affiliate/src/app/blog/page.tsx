import Link from "next/link"
import { SiteShell } from "@/components/site-shell"
import { getSiteSnapshot } from "@/lib/repository"

export default async function BlogIndex() {
  const { site, categories, posts } = await getSiteSnapshot()

  return (
    <SiteShell site={site} categories={categories}>
      <div className="section-head">
        <div>
          <h2>SEO Blog</h2>
          <p>Buying guides, coupon pages, roundups, and comparison articles.</p>
        </div>
      </div>
      {posts.length > 0 ? (
        <div className="article-grid">
          {posts.map((post) => (
            <article className="article-card" key={post.id}>
              <div className="eyebrow">Guide</div>
              <h3>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>
              <p>{post.excerpt}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          No SEO content is published for this site yet.
        </div>
      )}
    </SiteShell>
  )
}
