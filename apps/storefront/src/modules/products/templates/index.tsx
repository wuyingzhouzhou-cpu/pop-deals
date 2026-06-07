import React, { Suspense } from "react"
import { Text } from "@modules/common/components/ui"
import { HttpTypes } from "@medusajs/types"
import { notFound } from "next/navigation"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductInfo from "@modules/products/templates/product-info"
import RelatedProducts from "@modules/products/components/related-products"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import DealButton from "@modules/products/components/deal-button"
import ProductPrice from "@modules/products/components/product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  formatViewCount,
  getAffiliateLinks,
  getPrimaryAffiliateLink,
  getProductViewCount,
} from "@lib/util/affiliate"
import ShareLinkButton from "@modules/products/components/share-link-button"
import ProductViewTracker from "@modules/products/components/product-view-tracker"
import { Eye, ShoppingCart, Tag } from "@medusajs/icons"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
  viewCount?: number
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  countryCode,
  images,
  viewCount,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  const affiliateLinks = getAffiliateLinks(product.metadata)
  const primaryAffiliate = getPrimaryAffiliateLink(product.metadata)
  const storeName = primaryAffiliate?.label || "Marketplace"
  const productViewCount = viewCount ?? getProductViewCount(product)

  return (
    <div
      className="min-h-screen bg-[#f5f7fa] text-[#17202a]"
      data-testid="product-container"
    >
      <ProductViewTracker
        productId={product.id!}
        productTitle={product.title!}
      />
      <section className="border-b border-[#d7dde5] bg-white">
        <div className="content-container flex flex-wrap items-center justify-between gap-3 py-3">
          <LocalizedClientLink
            href="/store"
            className="text-small-semi text-[#1769aa] hover:text-[#125384]"
          >
            Back to frontpage deals
          </LocalizedClientLink>
          <div className="flex flex-wrap items-center gap-2 text-small-regular text-[#667085]">
            <span className="inline-flex items-center gap-1 rounded bg-[#fff3eb] px-2 py-1 text-[#b54708]">
              <Eye className="h-4 w-4" />
              {formatViewCount(productViewCount)} views
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-[#f2f4f7] px-2 py-1">
              <Tag className="h-4 w-4" />
              {storeName}
            </span>
          </div>
        </div>
      </section>

      <div className="content-container py-4 small:py-6">
        <div className="grid gap-4 medium:grid-cols-[minmax(0,1fr)_360px] medium:items-start">
          <main className="min-w-0 space-y-4">
            <section className="rounded border border-[#d7dde5] bg-white">
              <div className="border-b border-[#eaecf0] px-4 py-3">
                <Text className="text-small-semi uppercase text-[#667085]">
                  Deal images
                </Text>
              </div>
              <div className="p-3 small:p-4">
                <ImageGallery images={images} />
              </div>
            </section>

            <section className="rounded border border-[#d7dde5] bg-white p-4 small:p-5">
              <ProductInfo product={product} />
            </section>
          </main>

          <aside className="space-y-4 medium:sticky medium:top-24">
            <section className="rounded border border-[#d7dde5] bg-white p-4 shadow-[0_8px_20px_rgba(16,24,40,0.05)]">
              <div className="flex flex-wrap gap-2">
                <span className="rounded bg-[#ecfdf3] px-2 py-1 text-small-semi text-[#0f766e]">
                  Active deal
                </span>
                <span className="rounded bg-[#fff3eb] px-2 py-1 text-small-semi text-[#b54708]">
                  {formatViewCount(productViewCount)} views
                </span>
              </div>

              <h1 className="mt-3 text-2xl-semi leading-tight text-[#101828]">
                {product.title}
              </h1>

              <div className="mt-4 border-y border-[#eaecf0] py-4">
                <Text className="text-small-semi uppercase text-[#667085]">
                  Current price
                </Text>
                <div className="mt-1 text-[#b54708]">
                  {primaryAffiliate?.priceText || (
                    <ProductPrice product={product} />
                  )}
                </div>
              </div>

              <div className="mt-4">
                <DealButton
                  productId={product.id!}
                  productTitle={product.title!}
                  metadata={product.metadata}
                  handle={product.handle}
                  isCard={false}
                />
              </div>

              <div className="mt-3">
                <ShareLinkButton
                  productHandle={product.handle}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded border border-[#d7dde5] text-small-semi text-[#344054] hover:bg-[#f9fafb] hover:text-[#1769aa]"
                />
              </div>

              <div className="mt-4 grid gap-2 text-small-regular text-[#667085]">
                <div className="flex items-center justify-between">
                  <span>Store</span>
                  <span className="font-semibold text-[#101828]">
                    {storeName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Views</span>
                  <span className="font-semibold text-[#101828]">
                    {formatViewCount(productViewCount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Affiliate sources</span>
                  <span className="font-semibold text-[#101828]">
                    {affiliateLinks.length || 0}
                  </span>
                </div>
                {primaryAffiliate?.country && (
                  <div className="flex items-center justify-between">
                    <span>Country</span>
                    <span className="font-semibold uppercase text-[#101828]">
                      {primaryAffiliate.country}
                    </span>
                  </div>
                )}
                {primaryAffiliate?.accountUser && (
                  <div className="flex items-center justify-between">
                    <span>Account user</span>
                    <span className="max-w-[180px] truncate font-semibold text-[#101828]">
                      {primaryAffiliate.accountUser}
                    </span>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded border border-[#d7dde5] bg-white p-4">
              <Text className="flex items-center gap-2 text-base-semi text-[#101828]">
                <ShoppingCart className="h-5 w-5 text-[#1769aa]" />
                Other places to check
              </Text>
              <div className="mt-3 flex flex-wrap gap-2">
                {(affiliateLinks.length
                  ? affiliateLinks
                  : [{ source: "marketplace", label: "Marketplace" }]
                ).map((link) => (
                  <span
                    key={link.source}
                    className="rounded border border-[#d7dde5] bg-[#f9fafb] px-2 py-1 text-small-semi uppercase text-[#475467]"
                  >
                    {link.label}
                  </span>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>

      <div className="border-t border-[#d7dde5] bg-white">
        <div className="content-container py-8">
          <Suspense fallback={<SkeletonRelatedProducts />}>
            <RelatedProducts product={product} countryCode={countryCode} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default ProductTemplate
