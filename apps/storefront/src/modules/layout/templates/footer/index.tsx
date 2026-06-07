import { Text } from "@modules/common/components/ui"
import {
  getAffiliateCategories,
  getAffiliateCategoryLabel,
  listCategories,
} from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const productCategories = await listCategories()
  const affiliateCategories = getAffiliateCategories(
    productCategories,
    "categories"
  )
    .filter((category) => !category.parent_category_id)
    .slice(0, 8)

  return (
    <footer className="border-t border-ui-border-base bg-white">
      <div className="content-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo */}
          <div>
            <h3 className="text-xl font-bold">POP DEALS</h3>

            <p className="mt-3 text-sm text-gray-500">
              Discover trending products and the best deals from AliExpress,
              Shopee and other marketplaces.
            </p>
          </div>

          {affiliateCategories.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Categories</h4>

              <ul className="space-y-2 text-sm">
                {affiliateCategories.map((category) => (
                  <li key={category.id}>
                    <LocalizedClientLink
                      href={`/categories/${category.handle}`}
                      className="hover:text-ui-fg-base"
                    >
                      {getAffiliateCategoryLabel(category)}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>

            <ul className="space-y-2 text-sm">
              <li>
                <LocalizedClientLink href="/privacy-policy">
                  Privacy Policy
                </LocalizedClientLink>
              </li>

              <li>
                <LocalizedClientLink href="/terms">
                  Terms of Service
                </LocalizedClientLink>
              </li>

              <li>
                <LocalizedClientLink href="/affiliate-disclosure">
                  Affiliate Disclosure
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>

            <p className="text-sm text-gray-500">zhaoyunzhou@admergex.com</p>
          </div>
        </div>

        <div className="border-t mt-10 pt-6">
          <Text className="text-sm text-gray-500">
            © {new Date().getFullYear()} POP DEALS. All rights reserved.
          </Text>
        </div>
      </div>
    </footer>
  )
}
