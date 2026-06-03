import { Text } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import DealButton from "../deal-button"

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
  isRow = false,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
  isRow?: boolean
}) {
  const { cheapestPrice } = getProductPrice({ product })

  const affiliateSources = [
    "aliexpress",
    "shopee",
    "lazada",
    "tiktok",
    "shein",
    "trip",
  ]

  const activeSources = affiliateSources.filter(
    (s) =>
      typeof product.metadata?.[`affiliate_${s}`] === "string" &&
      (product.metadata?.[`affiliate_${s}`] as string).length > 0
  )

  // ========================== HORIZONTAL ROW LAYOUT (Home Page) ==========================
  if (isRow) {
    return (
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="group block h-full text-left"
      >
        <div
          className="grid h-full grid-cols-[92px_1fr] gap-3 rounded-2xl border border-[#cfd9e3] bg-white p-3 shadow-[0_10px_28px_rgba(21,59,101,0.06)] transition hover:border-[#0b65c2]/40 hover:shadow-[0_16px_40px_rgba(21,59,101,0.12)] xsmall:grid-cols-[132px_1fr] small:grid-cols-[154px_1fr_150px] small:gap-4"
          data-testid="product-wrapper"
        >
          <div className="relative overflow-hidden rounded-xl bg-[#eef3f8]">
            {activeSources.length > 0 && (
              <div className="absolute left-2 top-2 z-10 flex flex-wrap gap-1">
                {activeSources.slice(0, 2).map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-[#ff8a00] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              isFeatured={isFeatured}
              className="rounded-xl bg-transparent transition duration-500 group-hover:scale-105"
            />
          </div>

          <div className="flex flex-col justify-center py-1">
            <Text
              className="text-large-semi leading-6 tracking-[-0.02em] text-[#17202a] group-hover:text-[#0b65c2]"
              data-testid="product-title"
            >
              {product.title}
            </Text>

            {activeSources.length > 0 && (
              <div className="mb-2 flex flex-wrap items-center gap-1">
                {activeSources.map((s) => (
                  <span
                    key={s}
                    className="mt-2 rounded-full bg-[#e7f2ff] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-[#0b65c2]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="text-xl-semi text-[#b64000]">
                {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
              </div>
            </div>
          </div>

          <div className="col-span-2 flex items-center justify-end border-t border-[#e1e8ef] pt-3 small:col-span-1 small:border-l small:border-t-0 small:pl-4 small:pt-0">
            <div className="w-full rounded-full bg-[#0b65c2] px-5 py-3 text-center text-base-semi text-white transition hover:bg-[#084b90] small:w-auto">
              Buy Now
            </div>
          </div>
        </div>
      </LocalizedClientLink>
    )
  }

  // ========================== VERTICAL GRID CARD LAYOUT (Related Products) ==========================
  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block h-full text-left"
    >
      <div
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#cfd9e3] bg-white p-3 shadow-[0_10px_28px_rgba(21,59,101,0.06)] transition hover:border-[#0b65c2]/40 hover:shadow-[0_16px_40px_rgba(21,59,101,0.12)]"
        data-testid="product-wrapper"
      >
        <div className="relative aspect-square overflow-hidden rounded-xl bg-[#eef3f8]">
          {activeSources.length > 0 && (
            <div className="absolute left-2 top-2 z-10 flex flex-wrap gap-1">
              {activeSources.slice(0, 1).map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-[#ff8a00] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
            className="rounded-xl bg-transparent transition duration-500 group-hover:scale-105"
          />
        </div>

        <div className="mt-3 flex flex-1 flex-col">
          <Text
            className="line-clamp-2 text-base-semi leading-5 text-[#17202a] group-hover:text-[#0b65c2]"
            data-testid="product-title"
          >
            {product.title}
          </Text>

          <div className="mt-auto pt-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-large-semi text-[#b64000]">
                {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
              </div>
            </div>
            <div className="mt-3 rounded-full bg-[#0b65c2] px-4 py-2.5 text-center text-small-semi text-white transition hover:bg-[#084b90]">
              Buy Now
            </div>
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
