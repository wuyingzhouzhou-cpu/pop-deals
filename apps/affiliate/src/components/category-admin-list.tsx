import Link from "next/link"
import { deleteCategoryAction } from "@/app/admin/actions"
import type { Category } from "@/lib/types"

export function CategoryAdminList({
  categories,
  databaseReady,
}: {
  categories: Category[]
  databaseReady: boolean
}) {
  return (
    <div className="admin-panel">
      <h3>Categories</h3>
      <div className="product-admin-list">
        {categories.map((category) => {
          const parent = categories.find((item) => item.id === category.parentId)

          return (
            <article className="product-admin-item" key={category.id}>
              <div>
                <strong>{category.name}</strong>
                <span>
                  {category.navSection} ·{" "}
                  {parent ? `child of ${parent.name}` : "top level"} · sort{" "}
                  {category.sortOrder}
                </span>
              </div>
              <div className="product-actions">
                <Link className="button secondary" href={`/admin/categories/${category.id}`}>
                  Edit
                </Link>
                <form action={deleteCategoryAction}>
                  <input type="hidden" name="id" value={category.id} />
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
