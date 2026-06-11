import type { AffiliateProduct, Category, Site } from "@/lib/types"
import { createProductAction, updateProductAction } from "@/app/admin/actions"

const platformOptions = [
  ["tiktok_shop", "TikTok Shop"],
  ["aliexpress", "AliExpress"],
  ["shopee", "Shopee"],
  ["amazon", "Amazon"],
  ["lazada", "Lazada"],
]

export function ProductForm({
  site,
  categories,
  databaseReady,
  product,
}: {
  site: Site
  categories: Category[]
  databaseReady: boolean
  product?: AffiliateProduct
}) {
  const action = product ? updateProductAction : createProductAction

  return (
    <form className="admin-form" action={action}>
      <h3>{product ? "Edit Affiliate Product" : "Add Affiliate Product"}</h3>
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <input type="hidden" name="site_id" value={site.id} />
      <label>
        Title
        <input name="title" defaultValue={product?.title || ""} required />
      </label>
      <label>
        Slug
        <input
          name="slug"
          defaultValue={product?.slug || ""}
          placeholder="auto-generated if empty"
        />
      </label>
      <label>
        Category
        <select name="category_id" defaultValue={product?.categoryId || ""}>
          <option value="">No category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <div className="form-row">
        <label>
          Platform
          <select name="platform" defaultValue={product?.platform || "tiktok_shop"}>
            {platformOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Store title
          <input
            name="platform_title"
            defaultValue={product?.platformTitle || "TikTok Shop"}
          />
        </label>
        <label>
          Country
          <input name="country" defaultValue={product?.country || site.country} />
        </label>
      </div>
      <label>
        Affiliate URL
        <input
          name="affiliate_url"
          defaultValue={product?.affiliateUrl || ""}
          placeholder="https://..."
          required
        />
      </label>
      <div className="form-row">
        <label>
          Price text
          <input
            name="price_text"
            defaultValue={product?.priceText || ""}
            placeholder="$9.99"
          />
        </label>
        <label>
          Affiliate ID
          <input name="affiliate_id" defaultValue={product?.affiliateId || ""} />
        </label>
        <label>
          Account user
          <input name="account_user" defaultValue={product?.accountUser || ""} />
        </label>
      </div>
      <label>
        Creator username <span className="field-note">MCN only</span>
        <input
          name="creator_username"
          defaultValue={product?.creatorUsername || ""}
          placeholder="@creator"
        />
      </label>
      <label>
        Image URL
        <input
          name="image_url"
          defaultValue={product?.imageUrl || ""}
          placeholder="https://..."
        />
      </label>
      <label>
        Description
        <textarea
          name="description"
          defaultValue={product?.description || ""}
          rows={4}
        />
      </label>
      <label>
        Status
        <select name="status" defaultValue={product?.status || "published"}>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="disabled">Disabled</option>
        </select>
      </label>
      <button className="button" disabled={!databaseReady}>
        {product ? "Update Product" : "Save Product"}
      </button>
    </form>
  )
}
