import { Metadata } from "next"

import { listCategories } from "@lib/data/categories"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Frontpage Deals",
  description:
    "Community-style deal feed for trending products, coupons, and discounts.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const productCategories = await listCategories()

  return (
    <StoreTemplate
      sortBy="created_at"
      page="1"
      countryCode={countryCode}
      categories={productCategories}
    />
  )
}
