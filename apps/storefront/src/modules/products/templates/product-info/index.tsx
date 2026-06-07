import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChatBubbleLeftRight, Fire, Tag } from "@medusajs/icons"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const description =
    product.description ||
    "Community deal details, product notes, and store information will appear here when available."

  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="w-fit rounded bg-[#eef6ff] px-2 py-1 text-small-semi text-[#1769aa] hover:bg-[#d9ecff]"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          level="h2"
          className="text-2xl-semi leading-tight text-[#101828]"
          data-testid="product-title"
        >
          About this deal
        </Heading>

        <Text
          className="whitespace-pre-line text-base-regular text-[#475467]"
          data-testid="product-description"
        >
          {description}
        </Text>

        <div className="grid gap-3 pt-2 small:grid-cols-3">
          <div className="rounded border border-[#eaecf0] bg-[#f9fafb] p-3">
            <Fire className="h-5 w-5 text-[#b54708]" />
            <Text className="mt-2 text-small-semi text-[#101828]">
              Community heat
            </Text>
            <Text className="mt-1 text-small-regular text-[#667085]">
              Surface strong finds quickly.
            </Text>
          </div>
          <div className="rounded border border-[#eaecf0] bg-[#f9fafb] p-3">
            <Tag className="h-5 w-5 text-[#1769aa]" />
            <Text className="mt-2 text-small-semi text-[#101828]">
              Price clarity
            </Text>
            <Text className="mt-1 text-small-regular text-[#667085]">
              Keep the offer easy to scan.
            </Text>
          </div>
          <div className="rounded border border-[#eaecf0] bg-[#f9fafb] p-3">
            <ChatBubbleLeftRight className="h-5 w-5 text-[#0f766e]" />
            <Text className="mt-2 text-small-semi text-[#101828]">
              Deal talk
            </Text>
            <Text className="mt-1 text-small-regular text-[#667085]">
              Make questions and updates visible.
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductInfo
