import Link from "next/link"
import type { Metadata } from "next"
import { DealCard } from "@/components/deal-card"
import { SiteShell } from "@/components/site-shell"
import {
  categoryBySlug,
  navSectionLabel,
  productsForCategory,
  productsForSection,
  topLevelCategories,
} from "@/lib/category-navigation"
import { getSiteSnapshot } from "@/lib/repository"

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getSiteSnapshot()

  return {
    title: site.seoTitle || site.name,
    description: site.seoDescription || site.description,
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; section?: string; store?: string }>
}) {
  const params = await searchParams
  const { site, categories, products, posts } = await getSiteSnapshot()
  const categoryMap = new Map(
    categories.map((category) => [category.id, category])
  )
  const selectedCategory = categoryBySlug(categories, params.category)
  const sectionProducts = selectedCategory
    ? productsForCategory(products, categories, selectedCategory)
    : productsForSection(products, categories, params.section)
  const visibleProducts = params.store
    ? sectionProducts.filter(
        (product) => product.platformTitle === params.store
      )
    : sectionProducts
  const topCategories = topLevelCategories(categories)
  const totalViews = visibleProducts.reduce(
    (sum, product) => sum + product.viewCount,
    0
  )
  const totalClicks = visibleProducts.reduce(
    (sum, product) => sum + product.clickCount,
    0
  )
  const platforms = Array.from(
    new Set(products.map((product) => product.platformTitle))
  )
  const feedTitle =
    selectedCategory?.name ||
    (params.store ? `${params.store} Deals` : navSectionLabel(params.section))
  const feedDescription = selectedCategory
    ? selectedCategory.description || "Products from this affiliate category."
    : params.section
      ? `${feedTitle} products are shown from your affiliate categories.`
      : "Fresh affiliate picks ready for ads and social traffic."

  return (
    <SiteShell site={site} categories={categories}>
      <section className="deal-board-head">
        <div className="deal-board-copy">
          <h1>Today&apos;s Best Deals</h1>
          <p>{site.description}</p>
        </div>
        <div className="quick-stats">
          <span>{visibleProducts.length} deals</span>
          <span>{totalViews.toLocaleString()} views</span>
          <span>{totalClicks.toLocaleString()} clicks</span>
        </div>
      </section>

      <div className="deal-board">
        <aside className="deal-sidebar">
          <section className="sidebar-panel">
            <h2>Categories</h2>
            <div className="category-list">
              {topCategories.map((category) => (
                <Link key={category.id} href={`/?category=${category.slug}`}>
                  {category.name}
                </Link>
              ))}
            </div>
          </section>
          <section className="sidebar-panel">
            <h2>Stores</h2>
            <div className="category-list">
              {platforms.map((platform) => (
                <Link key={platform} href={`/?store=${encodeURIComponent(platform)}`}>
                  {platform}
                </Link>
              ))}
            </div>
          </section>
        </aside>

        <section className="deal-feed">
          <div className="feed-toolbar">
            <div>
              <h2>{feedTitle}</h2>
              <p>{feedDescription}</p>
            </div>
            <Link className="button secondary" href="/admin/products">
              Add Deal
            </Link>
          </div>
          {visibleProducts.length > 0 ? (
            <div className="deal-list">
              {visibleProducts.map((product) => (
                <DealCard
                  key={product.id}
                  product={product}
                  category={
                    product.categoryId
                      ? categoryMap.get(product.categoryId)
                      : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              {feedTitle} products are being added. Please check back soon.
            </div>
          )}
        </section>

        <aside className="deal-sidebar">
          <section className="sidebar-panel">
            <h2>Top Clicks</h2>
            {visibleProducts
              .slice()
              .sort((a, b) => b.clickCount - a.clickCount)
              .slice(0, 5)
              .map((product) => (
                <Link className="mini-deal" key={product.id} href={`/deals/${product.slug}`}>
                  <strong>{product.priceText || "Deal"}</strong>
                  <span>{product.title}</span>
                </Link>
              ))}
            {visibleProducts.length === 0 ? <p>No ranked deals yet.</p> : null}
          </section>
          <section className="sidebar-panel muted-panel">
            <h2>Shopping Guides</h2>
            {posts.slice(0, 3).map((post) => (
              <Link className="mini-deal" key={post.id} href={`/blog/${post.slug}`}>
                <strong>Guide</strong>
                <span>{post.title}</span>
              </Link>
            ))}
            {posts.length === 0 ? <p>No guides published yet.</p> : null}
          </section>
        </aside>
      </div>

      <section className="seo-strip">
        <div>
          <h2>Latest Shopping Guides</h2>
          <p>SEO content stays below the deal feed so ads land on offers first.</p>
        </div>
        <div className="seo-links">
          {posts.slice(0, 4).map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              {post.title}
            </Link>
          ))}
          {posts.length === 0 ? <span>No guides published yet.</span> : null}
        </div>
      </section>
    </SiteShell>
  )
}
