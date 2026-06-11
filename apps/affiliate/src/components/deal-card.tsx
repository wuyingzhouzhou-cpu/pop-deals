import Link from "next/link"
import { CopyLinkButton } from "@/components/copy-link-button"
import type { AffiliateProduct, Category } from "@/lib/types"

export function DealCard({
  product,
  category,
}: {
  product: AffiliateProduct
  category?: Category
}) {
  const dealHref = `/deals/${product.slug}`

  return (
    <article className="deal-card">
      <Link className="deal-image" href={dealHref}>
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt="" width="420" height="315" />
        ) : (
          <span>{product.platformTitle}</span>
        )}
      </Link>
      <div className="deal-card-body">
        <div className="deal-card-top">
          <span className="store-pill">{product.platformTitle}</span>
          <span>{category?.name || product.country}</span>
        </div>
        <h3>
          <Link href={dealHref}>{product.title}</Link>
        </h3>
        <p>{product.description}</p>
        <div className="deal-meta">
          <span>{product.country}</span>
          <span>{product.viewCount.toLocaleString()} views</span>
          <span>{product.clickCount.toLocaleString()} clicks</span>
        </div>
        <div className="price-row">
          <span className="price">{product.priceText || "Deal"}</span>
          <div className="deal-card-actions">
            <Link className="button" href={dealHref}>
              View Detail
            </Link>
            <CopyLinkButton href={dealHref} className="button secondary compact" />
          </div>
        </div>
      </div>
    </article>
  )
}
