import Link from "next/link"
import { notFound } from "next/navigation"
import { CopyLinkButton } from "@/components/copy-link-button"
import { ProductViewTracker } from "@/components/product-view-tracker"
import { SiteShell } from "@/components/site-shell"
import { getProductBySlug } from "@/lib/repository"

export default async function DealDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { site, product, categories } = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const clickId = `${product.id}-${Date.now()}`
  const dealHref = `/deals/${product.slug}`
  const category = product.categoryId
    ? categories.find((item) => item.id === product.categoryId)
    : null

  return (
    <SiteShell site={site} categories={categories}>
      <ProductViewTracker productId={product.id} />
      <div className="deal-detail">
        <div className="deal-detail-media">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt="" />
          ) : (
            <span>{product.platformTitle}</span>
          )}
        </div>
        <article className="deal-detail-main">
          <div className="deal-card-top">
            <span className="store-pill">{product.platformTitle}</span>
            <span>{category?.name || product.country}</span>
          </div>
          <h1>{product.title}</h1>
          <p className="detail-copy">{product.description}</p>
          <div className="detail-stats">
            <span>{product.viewCount.toLocaleString()} views</span>
            <span>{product.clickCount.toLocaleString()} clicks</span>
            <span>{product.country}</span>
          </div>
        </article>
        <aside className="buy-panel">
          <div className="buy-summary">
            <span className="buy-panel-label">Available at {product.platformTitle}</span>
            <div className="price">{product.priceText || "Deal"}</div>
          </div>
          <a
            className="button"
            href={`/api/track/click?product_id=${product.id}&click_id=${clickId}`}
          >
            Buy Now
          </a>
          <CopyLinkButton href={dealHref} />
          <Link className="button secondary" href="/">
            Back to Deals
          </Link>
          <p className="buy-panel-note">
            You will be redirected to the store after click tracking is recorded.
          </p>
        </aside>
        <section className="deal-info-grid">
          <div>
            <h2>Deal Summary</h2>
            <p>{product.description}</p>
          </div>
          <div>
            <h2>Store</h2>
            <p>{product.platformTitle}</p>
          </div>
          <div>
            <h2>Category</h2>
            <p>{category?.name || "General deals"}</p>
          </div>
        </section>
      </div>
    </SiteShell>
  )
}
