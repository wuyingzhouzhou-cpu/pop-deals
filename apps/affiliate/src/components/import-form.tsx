"use client"

import { useActionState } from "react"
import { importWorkbookAction } from "@/app/admin/actions"

const initialState = {
  ok: false,
  message: "",
  result: null as null | {
    sites: number
    categories: number
    products: number
    posts: number
    errors: string[]
    warnings: string[]
  },
}

export function ImportForm({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState(
    async (_state: typeof initialState, formData: FormData) => {
      return importWorkbookAction(formData)
    },
    initialState
  )

  return (
    <form className="admin-form" action={action}>
      <h3>Upload Excel Template</h3>
      <label>
        Excel file
        <input
          accept=".xlsx,.xls"
          disabled={disabled || pending}
          name="file"
          required
          type="file"
        />
      </label>
      <button className="button" disabled={disabled || pending}>
        {pending ? "Importing..." : "Import Workbook"}
      </button>

      {state.message ? (
        <div className={state.ok ? "notice success" : "notice"}>
          <strong>{state.message}</strong>
          {state.result ? (
            <p>
              Sites {state.result.sites}, Categories {state.result.categories},
              Products {state.result.products}, Blog Posts {state.result.posts}
            </p>
          ) : null}
          {state.result?.errors.length ? (
            <ul>
              {state.result.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : null}
          {state.result?.warnings.length ? (
            <ul>
              {state.result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </form>
  )
}
