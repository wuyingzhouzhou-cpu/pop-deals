import SearchBox from "@modules/layout/components/search-box"
import {
  getAffiliateCategories,
  getAffiliateCategoryLabel,
  listCategories,
} from "@lib/data/categories"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { HttpTypes, StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SideMenu from "@modules/layout/components/side-menu"

function NavMenu({
  label,
  categories,
}: {
  label: string
  categories: HttpTypes.StoreProductCategory[]
}) {
  const parents = categories.filter((category) => !category.parent_category_id)

  return (
    <div className="group relative shrink-0">
      <span className="block cursor-default rounded px-3 py-2 text-small-semi hover:bg-[#f2f4f7] hover:text-[#102033]">
        {label}
      </span>
      <div className="pointer-events-none invisible absolute left-0 top-full z-50 min-w-[280px] rounded border border-[#d7dde5] bg-white py-2 opacity-0 shadow-[0_12px_28px_rgba(16,24,40,0.12)] transition group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100">
        {parents.length > 0 ? (
          parents.map((category) => {
            const children = categories.filter(
              (child) => child.parent_category_id === category.id
            )

            return (
              <div key={category.id}>
                <LocalizedClientLink
                  href={`/categories/${category.handle}`}
                  className="block px-3 py-2 text-small-semi text-[#344054] hover:bg-[#eef6ff] hover:text-[#1769aa]"
                >
                  {getAffiliateCategoryLabel(category)}
                </LocalizedClientLink>
                {children.length > 0 && (
                  <div className="pb-1">
                    {children.map((child) => (
                      <LocalizedClientLink
                        key={child.id}
                        href={`/categories/${child.handle}`}
                        className="block px-6 py-1.5 text-small-regular text-[#667085] hover:bg-[#eef6ff] hover:text-[#1769aa]"
                      >
                        {getAffiliateCategoryLabel(child)}
                      </LocalizedClientLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="px-3 py-2 text-small-regular text-[#667085]">
            {label} pending
          </div>
        )}
      </div>
    </div>
  )
}

export default async function Nav() {
  const productCategories = await listCategories()
  const categoryItems = getAffiliateCategories(productCategories, "categories")
  const travelItems = getAffiliateCategories(productCategories, "travel")
  const digitalServiceItems = getAffiliateCategories(
    productCategories,
    "digital_services"
  )
  const gamingItems = getAffiliateCategories(productCategories, "gaming")

  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky inset-x-0 top-0 z-50 bg-white">
      <header className="relative border-b border-[#d7dde5] bg-white">
        <nav className="content-container flex min-h-[68px] w-full items-center gap-3 text-small-regular text-[#475467]">
          <div className="flex h-full items-center small:hidden">
            <div className="h-full">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>
          </div>

          <LocalizedClientLink
            href="/"
            className="flex shrink-0 items-center gap-2 text-large-semi font-bold text-[#102033]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded bg-[#f36f21] text-base-semi text-white">
              D
            </span>
            <span className="hidden whitespace-nowrap xsmall:inline">
              DealFront
            </span>
          </LocalizedClientLink>

          <div className="hidden min-w-0 flex-1 items-center gap-1 px-1 small:flex">
            <LocalizedClientLink
              href="/store"
              className="shrink-0 rounded px-3 py-2 text-small-semi text-[#102033] hover:bg-[#f2f4f7]"
            >
              Deals
            </LocalizedClientLink>
            <NavMenu label="Categories" categories={categoryItems} />
            <NavMenu label="Travel" categories={travelItems} />
            <NavMenu
              label="Digital Services"
              categories={digitalServiceItems}
            />
            <NavMenu label="Gaming" categories={gamingItems} />
            <LocalizedClientLink
              href="/store?channel=coupons"
              className="shrink-0 rounded px-3 py-2 text-small-semi hover:bg-[#f2f4f7] hover:text-[#102033]"
            >
              Coupons
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/store?channel=personal-finance"
              className="shrink-0 rounded px-3 py-2 text-small-semi hover:bg-[#f2f4f7] hover:text-[#102033]"
            >
              Personal Finance
            </LocalizedClientLink>
          </div>

          <div className="flex flex-1 justify-end small:max-w-[520px]">
            <SearchBox />
          </div>
        </nav>
      </header>
    </div>
  )
}
