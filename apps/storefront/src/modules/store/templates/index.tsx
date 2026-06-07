import { Suspense } from "react"

import { HttpTypes } from "@medusajs/types"
import { listCoupons } from "@lib/data/coupons"
import {
  getAffiliateCategories,
  getAffiliateCategoryLabel,
} from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { BellAlert, Eye, Fire, Tag, Users } from "@medusajs/icons"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
  categories,
  channel = "deals",
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  categories?: HttpTypes.StoreProductCategory[]
  channel?: "deals" | "categories" | "coupons" | "personal-finance"
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const allCategoryItems = getAffiliateCategories(categories, "categories")
  const visibleCategories = allCategoryItems
    .filter((category) => !category.parent_category_id)
    .slice(0, 12)
  const financeCategories = getAffiliateCategories(
    categories,
    "personal_finance"
  )
  const channelTitle =
    channel === "categories"
      ? "Categories"
      : channel === "coupons"
      ? "Coupons"
      : channel === "personal-finance"
      ? "Personal Finance"
      : "Frontpage deals"

  return (
    <div
      className="min-h-screen bg-[#f5f7fa] text-[#17202a]"
      data-testid="category-container"
    >
      <section className="border-b border-[#d7dde5] bg-white">
        <div className="content-container grid gap-4 py-4 medium:grid-cols-[minmax(0,1fr)_320px] medium:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded bg-[#fff3eb] px-2 py-1 text-small-semi text-[#b54708]">
                <Fire className="h-4 w-4" />
                Hot today
              </span>
              <span className="text-small-regular text-[#667085]">
                Curated affiliate deals, coupons, and price drops
              </span>
            </div>
            <h1 className="mt-3 text-3xl-semi leading-tight text-[#101828] small:text-[38px] small:leading-[46px]">
              {channelTitle}
            </h1>
            <p className="mt-2 max-w-3xl text-base-regular text-[#475467]">
              Browse the latest finds with clear prices, store context, and
              traffic signals.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded border border-[#d7dde5] bg-[#fbfcfd] p-2">
            <div className="rounded bg-white p-3 text-center">
              <p className="text-xl-semi text-[#b54708]">128</p>
              <p className="text-xsmall-regular uppercase text-[#667085]">
                Hot deals
              </p>
            </div>
            <div className="rounded bg-white p-3 text-center">
              <p className="text-xl-semi text-[#1769aa]">42</p>
              <p className="text-xsmall-regular uppercase text-[#667085]">
                Coupons
              </p>
            </div>
            <div className="rounded bg-white p-3 text-center">
              <p className="text-xl-semi text-[#0f766e]">9k</p>
              <p className="text-xsmall-regular uppercase text-[#667085]">
                Members
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d7dde5] bg-white">
        <div className="content-container flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
          <span className="shrink-0 text-small-semi uppercase text-[#667085]">
            Affiliate categories
          </span>
          {visibleCategories.map((category) => (
            <LocalizedClientLink
              href={`/categories/${category.handle}`}
              key={category.id}
              className="shrink-0 rounded border border-[#d7dde5] bg-[#f9fafb] px-3 py-1.5 text-small-semi text-[#344054] transition hover:border-[#1769aa] hover:bg-[#eef6ff] hover:text-[#1769aa]"
            >
              {getAffiliateCategoryLabel(category)}
            </LocalizedClientLink>
          ))}
        </div>
      </section>

      <section id="top-deals" className="content-container py-4 small:py-6">
        <div className="grid gap-4 medium:grid-cols-[minmax(0,1fr)_320px] medium:items-start">
          <main className="min-w-0">
            {channel === "deals" && (
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded border border-[#d7dde5] bg-white px-3 py-2">
                <div className="flex items-center gap-2">
                  <button className="rounded bg-[#1769aa] px-3 py-1.5 text-small-semi text-white">
                    Frontpage
                  </button>
                  <button className="rounded px-3 py-1.5 text-small-semi text-[#475467] hover:bg-[#f2f4f7]">
                    New
                  </button>
                  <button className="rounded px-3 py-1.5 text-small-semi text-[#475467] hover:bg-[#f2f4f7]">
                    Most viewed
                  </button>
                </div>
                <p className="text-small-regular text-[#667085]">
                  Sorted by newest finds
                </p>
              </div>
            )}

            {channel === "deals" && (
              <Suspense fallback={<SkeletonProductGrid />}>
                <PaginatedProducts
                  sortBy={sort}
                  page={pageNumber}
                  countryCode={countryCode}
                />
              </Suspense>
            )}

            {channel === "categories" && (
              <CategoryChannel categories={allCategoryItems} />
            )}

            {channel === "coupons" && <CouponsChannel />}

            {channel === "personal-finance" && (
              <PersonalFinanceChannel categories={financeCategories} />
            )}
          </main>

          <Suspense
            fallback={
              <aside className="order-first rounded border border-[#d7dde5] bg-white medium:order-none">
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
    <aside className="order-first space-y-4 medium:sticky medium:top-24 medium:order-none">
      <section className="rounded border border-[#d7dde5] bg-white">
        <h3 className="border-b border-[#d7dde5] px-4 py-3 text-base-semi text-[#101828]">
          Deal traffic
        </h3>
        <div className="grid gap-3 p-4 text-small-regular text-[#475467]">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-[#1769aa]" />
            <span>People are browsing price drops across top stores.</span>
          </div>
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-[#0f766e]" />
            <span>View counts help surface products with stronger demand.</span>
          </div>
          <div className="flex items-center gap-3">
            <BellAlert className="h-5 w-5 text-[#b54708]" />
            <span>Deal alerts can become the next account feature.</span>
          </div>
        </div>
      </section>

      <section
        id="coupons"
        className="overflow-hidden rounded border border-[#d7dde5] bg-white"
      >
        <h3 className="flex items-center gap-2 border-b border-[#d7dde5] px-4 py-3 text-base-semi text-[#101828]">
          <Tag className="h-5 w-5 text-[#1769aa]" />
          Featured coupons
        </h3>
        <div className="flex overflow-x-auto px-3 no-scrollbar medium:block medium:overflow-visible">
          {coupons.map((coupon) => (
            <a
              href="#top-deals"
              key={String(coupon.brand)}
              className="grid w-[270px] shrink-0 grid-cols-[64px_1fr] gap-3 border-r border-[#eaecf0] py-4 pr-3 last:border-r-0 medium:w-auto medium:border-b medium:border-r-0 medium:pr-0 medium:last:border-b-0"
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className="flex h-10 w-14 items-center justify-center rounded text-small-semi text-white"
                  style={{ backgroundColor: String(coupon.color || "#1769aa") }}
                >
                  {String(coupon.logo || "")}
                </div>
                <span className="w-full rounded bg-[#fff3eb] px-2 py-1 text-center text-[10px] font-bold uppercase leading-none text-[#b54708]">
                  Coupon
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-base-semi leading-5 text-[#1769aa]">
                  {String(coupon.offer || "")}
                </p>
                <p className="mt-1 text-small-regular leading-4 text-[#101828]">
                  {String(coupon.title || "")}
                </p>
                <p className="mt-2 text-small-regular leading-4 text-[#667085]">
                  Use Coupon Code:{" "}
                  <span className="rounded bg-[#eef6ff] px-1.5 py-0.5 text-small-semi text-[#1769aa]">
                    {String(coupon.code || "")}
                  </span>
                </p>
                <p className="mt-2 text-small-regular leading-4 text-[#667085]">
                  <span className="rounded bg-[#ecfdf3] px-1 text-[#0f766e]">
                    {String(coupon.redemptions || "0")}
                  </span>{" "}
                  Redemptions
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section
        id="personal-finance"
        className="rounded border border-[#d7dde5] bg-white p-4"
      >
        <h3 className="text-base-semi text-[#101828]">Personal Finance</h3>
        <p className="mt-2 text-small-regular leading-5 text-[#667085]">
          Credit cards, cashback, bank bonuses, travel points, and payment
          offers can live here as a separate affiliate channel.
        </p>
      </section>
    </aside>
  )
}

function EmptyChannel({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded border border-[#d7dde5] bg-white p-8 text-center">
      <p className="text-base-semi text-[#101828]">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-small-regular leading-5 text-[#667085]">
        {description}
      </p>
    </div>
  )
}

function CategoryChannel({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) {
  if (!categories.length) {
    return (
      <EmptyChannel
        title="Affiliate categories are not configured yet"
        description="Go to Affiliate Categories in the admin, mark product categories as affiliate categories, and assign them to the Categories channel."
      />
    )
  }

  const topLevel = categories.filter((category) => !category.parent_category_id)
  const standalone = topLevel.length ? topLevel : categories

  return (
    <div className="grid gap-3 small:grid-cols-2">
      {standalone.map((category) => {
        const children = categories.filter(
          (child) => child.parent_category_id === category.id
        )

        return (
          <div
            key={category.id}
            className="rounded border border-[#d7dde5] bg-white p-4"
          >
            <LocalizedClientLink
              href={`/categories/${category.handle}`}
              className="text-base-semi text-[#101828] hover:text-[#1769aa]"
            >
              {getAffiliateCategoryLabel(category)}
            </LocalizedClientLink>
            {children.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {children.map((child) => (
                  <LocalizedClientLink
                    key={child.id}
                    href={`/categories/${child.handle}`}
                    className="rounded border border-[#d7dde5] bg-[#f9fafb] px-2 py-1 text-small-semi text-[#475467] hover:border-[#1769aa] hover:bg-[#eef6ff] hover:text-[#1769aa]"
                  >
                    {getAffiliateCategoryLabel(child)}
                  </LocalizedClientLink>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-small-regular text-[#667085]">
                Products pending
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

async function CouponsChannel() {
  const coupons = await listCoupons()

  if (!coupons?.length) {
    return (
      <EmptyChannel
        title="Coupons are not configured yet"
        description="Add coupon content in the backend Coupons page. This channel will stay empty until real coupon data exists."
      />
    )
  }

  return (
    <div className="grid gap-3 small:grid-cols-2">
      {coupons.map((coupon) => (
        <div
          key={String(coupon.brand)}
          className="rounded border border-[#d7dde5] bg-white p-4"
        >
          <p className="text-large-semi text-[#1769aa]">
            {String(coupon.offer || "")}
          </p>
          <p className="mt-1 text-small-regular text-[#101828]">
            {String(coupon.title || "")}
          </p>
          <p className="mt-3 text-small-regular text-[#667085]">
            Code:{" "}
            <span className="rounded bg-[#eef6ff] px-2 py-1 text-small-semi text-[#1769aa]">
              {String(coupon.code || "")}
            </span>
          </p>
        </div>
      ))}
    </div>
  )
}

function PersonalFinanceChannel({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) {
  if (!categories.length) {
    return (
      <EmptyChannel
        title="Personal Finance products are pending"
        description="When you add credit cards, cashback, bank bonuses, or travel-point offers, mark their categories as Personal Finance in Affiliate Categories."
      />
    )
  }

  return <CategoryChannel categories={categories} />
}

export default StoreTemplate
