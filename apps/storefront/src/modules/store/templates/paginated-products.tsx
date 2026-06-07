import { getAffiliateProductViews } from "@lib/data/affiliate-views"
import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
  })

  const affiliateProducts = products.filter((product) => {
    const metadata = product.metadata || {}

    return metadata.affiliate_product_type === "guide" || metadata.affiliate_url
  })
  const viewCounts = await getAffiliateProductViews(
    affiliateProducts.map((product) => product.id!)
  )
  const totalPages = Math.ceil(affiliateProducts.length / PRODUCT_LIMIT)

  return (
    <>
      <ul className="grid w-full grid-cols-1 gap-3" data-testid="products-list">
        {affiliateProducts.map((p) => {
          return (
            <li key={p.id}>
              <ProductPreview
                product={p}
                region={region}
                isRow={true}
                viewCount={viewCounts[p.id!] || undefined}
              />
            </li>
          )
        })}
      </ul>
      {affiliateProducts.length === 0 && (
        <div className="rounded border border-[#d7dde5] bg-white p-8 text-center">
          <p className="text-base-semi text-[#101828]">
            No affiliate products yet
          </p>
          <p className="mt-2 text-small-regular text-[#667085]">
            Add guide products in Affiliate Product Manager, then assign them to
            affiliate categories.
          </p>
        </div>
      )}
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
