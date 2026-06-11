import type { Category, Site } from "@/lib/types"
import { createCategoryAction, updateCategoryAction } from "@/app/admin/actions"

const navSections = [
  ["categories", "Categories"],
  ["coupons", "Coupons"],
  ["travel", "Travel"],
  ["digital_services", "Digital Services"],
  ["gaming", "Gaming"],
  ["personal_finance", "Personal Finance"],
]

export function CategoryForm({
  site,
  categories,
  databaseReady,
  category,
}: {
  site: Site
  categories: Category[]
  databaseReady: boolean
  category?: Category
}) {
  const action = category ? updateCategoryAction : createCategoryAction
  const parentChoices = categories.filter((item) => item.id !== category?.id)

  return (
    <form className="admin-form" action={action}>
      <h3>{category ? "Edit Category" : "Add Category"}</h3>
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <input type="hidden" name="site_id" value={site.id} />
      <label>
        Name
        <input name="name" defaultValue={category?.name || ""} required />
      </label>
      <label>
        Slug
        <input
          name="slug"
          defaultValue={category?.slug || ""}
          placeholder="auto-generated if empty"
        />
      </label>
      <div className="form-row">
        <label>
          Nav section
          <select
            name="nav_section"
            defaultValue={category?.navSection || "categories"}
          >
            {navSections.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Parent
          <select name="parent_id" defaultValue={category?.parentId || ""}>
            <option value="">Top level</option>
            {parentChoices.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sort
          <input
            name="sort_order"
            defaultValue={String(category?.sortOrder || 0)}
            inputMode="numeric"
          />
        </label>
      </div>
      <label>
        Description
        <textarea
          name="description"
          defaultValue={category?.description || ""}
          rows={4}
        />
      </label>
      <button className="button" disabled={!databaseReady}>
        {category ? "Update Category" : "Save Category"}
      </button>
    </form>
  )
}
