import React, { Suspense } from "react"
import { Text } from "@modules/common/components/ui"
import { HttpTypes } from "@medusajs/types"
import { notFound } from "next/navigation"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductInfo from "@modules/products/templates/product-info"
import RelatedProducts from "@modules/products/components/related-products"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import DealButton from "@modules/products/components/deal-button"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <div
      className="bg-[#eef3f8] text-[#17202a]"
      data-testid="product-container"
    >
      <div className="content-container py-6 small:py-8">
        <div className="grid gap-6 small:grid-cols-[1fr_360px] small:items-start">
          <div className="overflow-hidden rounded-2xl border border-[#cfd9e3] bg-white p-4 small:p-6">
            <ImageGallery images={images} />
          </div>

          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-2xl border border-[#cfd9e3] bg-white p-5">
              <ProductInfo product={product} />

              <div className="mt-6 border-t border-[#e1e8ef] pt-5">
                <Text className="text-small-semi uppercase tracking-[0.18em] text-[#6b7c8c]">
                  Available deals
                </Text>
                <div className="mt-3">
                  <DealButton
                    productId={product.id!}
                    productTitle={product.title!}
                    metadata={product.metadata}
                    handle={product.handle}
                    isCard={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-container pb-12">
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </div>
  )
}

export default ProductTemplate
