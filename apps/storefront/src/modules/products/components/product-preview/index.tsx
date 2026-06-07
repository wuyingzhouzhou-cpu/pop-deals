import { Text } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import {
  formatViewCount,
  getAffiliateLinks,
  getPrimaryAffiliateLink,
  getProductViewCount,
} from "@lib/util/affiliate"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import ShareLinkButton from "../share-link-button"
import { Eye, ShoppingCart, Tag } from "@medusajs/icons"

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
  isRow = false,
  viewCount,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
  isRow?: boolean
  viewCount?: number
}) {
  const { cheapestPrice } = getProductPrice({ product })

  const affiliateLinks = getAffiliateLinks(product.metadata)
  const primaryAffiliate = getPrimaryAffiliateLink(product.metadata)
  const storeName = primaryAffiliate?.label || "Marketplace"
  const productViewCount = viewCount ?? getProductViewCount(product)
  const percentageDiff = Number(cheapestPrice?.percentage_diff || 0)
  const savingsText = percentageDiff > 0 ? `${percentageDiff}% off` : "Deal"

  if (isRow) {
    return (
      <div
        className="grid grid-cols-[72px_1fr] gap-3 rounded border border-[#d7dde5] bg-white p-3 transition hover:border-[#9ec7ea] hover:shadow-[0_8px_20px_rgba(16,24,40,0.08)] xsmall:grid-cols-[104px_1fr] small:grid-cols-[116px_1fr_148px]"
        data-testid="product-wrapper"
      >
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="relative block overflow-hidden rounded bg-[#f2f4f7]"
        >
          <div className="absolute left-2 top-2 z-10 rounded bg-[#fff3eb] px-2 py-0.5 text-[10px] font-bold uppercase leading-4 text-[#b54708]">
            {savingsText}
          </div>
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
            className="rounded bg-transparent transition duration-300 hover:scale-105"
          />
        </LocalizedClientLink>

        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-small-regular text-[#667085]">
            <span className="inline-flex items-center gap-1 rounded bg-[#ecfdf3] px-2 py-1 text-[#0f766e]">
              <Eye className="h-3.5 w-3.5" />
              {formatViewCount(productViewCount)} views
            </span>
            <span className="inline-flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              {storeName}
            </span>
          </div>

          <LocalizedClientLink href={`/products/${product.handle}`}>
            <Text
              className="text-base-semi leading-5 text-[#101828] hover:text-[#1769aa] small:text-large-semi small:leading-6"
              data-testid="product-title"
            >
              {product.title}
            </Text>
          </LocalizedClientLink>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div className="text-xl-semi text-[#b54708]">
              {primaryAffiliate?.priceText ||
                (cheapestPrice && <PreviewPrice price={cheapestPrice} />)}
            </div>
            {cheapestPrice?.original_price &&
              !primaryAffiliate?.priceText &&
              cheapestPrice.price_type === "sale" && (
                <span className="text-small-regular text-[#98a2b3]">
                  list price shown before discount
                </span>
              )}
          </div>

          {affiliateLinks.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {affiliateLinks.slice(0, 4).map((link) => (
                <span
                  key={link.source}
                  className="rounded border border-[#d7dde5] bg-[#f9fafb] px-2 py-1 text-[11px] font-semibold uppercase text-[#475467]"
                >
                  {link.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-2 flex items-center justify-between gap-3 border-t border-[#eaecf0] pt-3 small:col-span-1 small:flex-col small:items-stretch small:justify-center small:border-l small:border-t-0 small:pl-4 small:pt-0">
          <LocalizedClientLink
            href={`/products/${product.handle}`}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded bg-[#1769aa] px-4 text-small-semi text-white hover:bg-[#125384] small:flex-none"
          >
            <ShoppingCart className="h-4 w-4" />
            View Deal
          </LocalizedClientLink>
          <ShareLinkButton
            productHandle={product.handle}
            compact
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded border border-[#d7dde5] px-3 text-small-semi text-[#344054] hover:bg-[#f9fafb] hover:text-[#1769aa] small:flex-none"
          />
        </div>
      </div>
    )
  }

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block h-full text-left"
    >
      <div
        className="flex h-full flex-col overflow-hidden rounded border border-[#d7dde5] bg-white p-3 transition hover:border-[#9ec7ea] hover:shadow-[0_8px_20px_rgba(16,24,40,0.08)]"
        data-testid="product-wrapper"
      >
        <div className="relative aspect-square overflow-hidden rounded bg-[#f2f4f7]">
          {affiliateLinks.length > 0 && (
            <div className="absolute left-2 top-2 z-10 flex flex-wrap gap-1">
              {affiliateLinks.slice(0, 1).map((link) => (
                <span
                  key={link.source}
                  className="rounded bg-[#fff3eb] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#b54708]"
                >
                  {link.label}
                </span>
              ))}
            </div>
          )}
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
            className="rounded bg-transparent transition duration-300 group-hover:scale-105"
          />
        </div>

        <div className="mt-3 flex flex-1 flex-col">
          <Text
            className="line-clamp-2 text-base-semi leading-5 text-[#101828] group-hover:text-[#1769aa]"
            data-testid="product-title"
          >
            {product.title}
          </Text>

          <div className="mt-auto pt-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-large-semi text-[#b54708]">
                {primaryAffiliate?.priceText ||
                  (cheapestPrice && <PreviewPrice price={cheapestPrice} />)}
              </div>
            </div>
            <div className="mt-3 rounded bg-[#1769aa] px-4 py-2.5 text-center text-small-semi text-white transition hover:bg-[#125384]">
              View Deal
            </div>
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
