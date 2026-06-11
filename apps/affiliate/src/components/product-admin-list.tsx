import Link from "next/link"
import {
  deleteProductAction,
  updateProductStatusAction,
} from "@/app/admin/actions"
import type { AffiliateProduct } from "@/lib/types"

export function ProductAdminList({
  products,
  databaseReady,
}: {
  products: AffiliateProduct[]
  databaseReady: boolean
}) {
  return (
    <div className="admin-panel">
      <h3>Products</h3>
      <div className="product-admin-list">
        {products.map((product) => {
          const nextStatus =
            product.status === "published" ? "disabled" : "published"

          return (
            <article className="product-admin-item" key={product.id}>
              <div>
                <strong>{product.title}</strong>
                <span>
                  {product.platformTitle} · {product.status} ·{" "}
                  {product.viewCount.toLocaleString()} views ·{" "}
                  {product.clickCount.toLocaleString()} clicks
                </span>
              </div>
              <div className="product-actions">
                <Link className="button secondary" href={`/admin/products/${product.id}`}>
                  Edit
                </Link>
                <form action={updateProductStatusAction}>
                  <input type="hidden" name="id" value={product.id} />
                  <input type="hidden" name="status" value={nextStatus} />
                  <button className="button secondary" disabled={!databaseReady}>
                    {product.status === "published" ? "Disable" : "Publish"}
                  </button>
                </form>
                <form action={deleteProductAction}>
                  <input type="hidden" name="id" value={product.id} />
                  <button className="button danger" disabled={!databaseReady}>
                    Delete
                  </button>
                </form>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
