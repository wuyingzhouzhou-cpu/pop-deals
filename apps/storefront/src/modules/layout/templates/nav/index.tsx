
import SearchBox from "@modules/layout/components/search-box"
import { listCategories } from "@lib/data/categories"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  
  const productCategories = await listCategories()

  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
            </div>
          </div>
	 
	  <LocalizedClientLink
		href="/"
		className="text-xl font-bold text-black whitespace-nowrap"
	  >
		POP DEALS
	  </LocalizedClientLink>
	  <div className="hidden md:flex items-center gap-8 mx-10">
  		{productCategories.map((c) => (
    		<LocalizedClientLink
      			key={c.id}
      			href={`/categories/${c.handle}`}
      			className="hover:text-black font-medium"
    		>
      		{c.name}
    		</LocalizedClientLink>
  		))}
	  </div>

          <div className="flex-1 flex justify-end">
            <SearchBox />
	  </div>
        </nav>
      </header>
    </div>
  )
}
