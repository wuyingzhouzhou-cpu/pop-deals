import { Suspense } from "react"

import { HttpTypes } from "@medusajs/types"
import { listCoupons } from "@lib/data/coupons"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
  categories,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  categories?: HttpTypes.StoreProductCategory[]
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div
      className="bg-[#eef3f8] text-[#17202a]"
      data-testid="category-container"
    >
      <section className="border-b border-[#cfd9e3] bg-[#153b65] text-white">
        <div className="content-container flex flex-col gap-3 py-3 small:flex-row small:items-center small:justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#ff8a00] px-3 py-1 text-small-semi uppercase tracking-[0.16em] text-white">
              Hot today
            </span>
            <p className="text-base-semi">
              Collectible deals, price drops, and coupon finds updated daily
            </p>
          </div>
          <a
            href="#top-deals"
            className="text-small-semi uppercase tracking-[0.16em] text-[#bfe3ff] hover:text-white"
          >
            Jump to latest products
          </a>
        </div>
      </section>

      <section className="border-y border-[#cfd9e3] bg-white">
        <div className="content-container flex gap-3 overflow-x-auto py-3 no-scrollbar">
          <span className="shrink-0 text-small-semi uppercase tracking-[0.18em] text-[#6b7c8c]">
            Trending
          </span>
          {categories?.map((category) => (
            <a
              href={`/categories/${category.handle}`}
              key={category.id}
              className="shrink-0 rounded-full bg-[#eef3f8] px-4 py-1.5 text-small-semi text-[#153b65] transition hover:bg-[#0b65c2] hover:text-white"
            >
              {category.name}
            </a>
          ))}
        </div>
      </section>

      <section id="top-deals" className="content-container py-6 small:py-8">
        <div className="mb-4 flex flex-col gap-3 small:flex-row small:items-end small:justify-between">
          <div>
            <p className="text-small-semi uppercase tracking-[0.22em] text-[#0b65c2]">
              Frontpage deals
            </p>
            <h2 className="mt-1 text-2xl-semi tracking-[-0.04em]">
              Latest products
            </h2>
          </div>
          <p className="max-w-md text-small-regular text-[#5b6b7b]">
            Deals may contain affiliate links. We focus on price clarity,
            urgency, and click-through value.
          </p>
        </div>
        <div className="grid gap-5 medium:grid-cols-[minmax(0,1fr)_300px] medium:items-start">
          <main className="min-w-0">
            <Suspense fallback={<SkeletonProductGrid />}>
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                countryCode={countryCode}
              />
            </Suspense>
          </main>

          <Suspense
            fallback={
              <aside className="order-first rounded-lg border border-[#d4d4d4] bg-white medium:order-none">
                <div className="px-4 py-8 text-center text-small-regular text-[#8a8a8a]">
                  Loading coupons...
                </div>
              </aside>
            }
          >
            <CouponSidebar />
          </Suspense>
        </div>
      </section>
    </div>
  )
}

async function CouponSidebar() {
  const coupons = await listCoupons()

  if (!coupons || coupons.length === 0) {
    return null
  }

  return (
    <aside className="order-first overflow-hidden rounded-lg border border-[#d4d4d4] bg-white shadow-[0_8px_22px_rgba(21,59,101,0.05)] medium:sticky medium:top-24 medium:order-none">
      <h3 className="border-b border-[#d4d4d4] px-4 py-3 text-base-semi text-[#111] small:text-large-semi">
        Featured Coupons & Discounts
      </h3>
      <div className="flex overflow-x-auto px-3 no-scrollbar medium:block medium:overflow-visible">
        {coupons.map((coupon) => (
          <a
            href="#top-deals"
            key={String(coupon.brand)}
            className="grid w-[270px] shrink-0 grid-cols-[68px_1fr] gap-3 border-r border-[#d9d9d9] py-4 pr-3 last:border-r-0 medium:w-auto medium:grid-cols-[76px_1fr] medium:border-b medium:border-r-0 medium:pr-0 medium:last:border-b-0"
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex h-10 w-14 items-center justify-center rounded-sm text-small-semi text-white"
                style={{ backgroundColor: String(coupon.color || "#bd4f83") }}
              >
                {String(coupon.logo || "")}
              </div>
              <span className="w-full rounded-sm bg-[#bd4f83] px-2 py-1 text-center text-[10px] font-bold uppercase leading-none text-white">
                Coupon
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-base-semi leading-5 text-[#bd4f83]">
                {String(coupon.offer || "")}
              </p>
              <p className="mt-1 text-small-regular leading-4 text-[#111]">
                {String(coupon.title || "")}
              </p>
              <p className="mt-2 text-small-regular leading-4 text-[#8a8a8a]">
                Use Coupon Code:{" "}
                <span className="rounded-sm bg-[#bd4f83] px-1.5 py-0.5 text-small-semi text-white">
                  {String(coupon.code || "")}
                </span>
              </p>
              <p className="mt-2 text-small-regular leading-4 text-[#8a8a8a]">
                <span className="rounded-sm bg-[#f7e5ef] px-1 text-[#bd4f83]">
                  {String(coupon.redemptions || "0")}
                </span>{" "}
                Redemptions
              </p>
            </div>
          </a>
        ))}
      </div>
    </aside>
  )
}

export default StoreTemplate
