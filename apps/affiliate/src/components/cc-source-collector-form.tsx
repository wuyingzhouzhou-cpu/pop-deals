"use client"

import Link from "next/link"
import { useActionState } from "react"
import { collectCcSourceAction } from "@/app/admin/actions"

const initialState = {
  ok: false,
  message: "",
  article: null as null | {
    title: string
    author: string
    license: string
    licenseUrl: string
    wordCount: number
    slug: string
  },
}

export function CcSourceCollectorForm({
  siteId,
  disabled,
}: {
  siteId: string
  disabled: boolean
}) {
  const [state, action, pending] = useActionState(
    collectCcSourceAction,
    initialState
  )

  return (
    <form className="admin-form" action={action}>
      <h3>Collect CC Source</h3>
      <input type="hidden" name="site_id" value={siteId} />
      <label>
        Source URL
        <input
          disabled={disabled || pending}
          name="source_url"
          placeholder="https://example.com/long-cc-by-article"
          required
          type="url"
        />
      </label>
      <div className="form-row">
        <label>
          Title override
          <input
            disabled={disabled || pending}
            name="title_override"
            placeholder="Optional"
          />
        </label>
        <label>
          Author override
          <input
            disabled={disabled || pending}
            name="author_override"
            placeholder="Required if page has no author metadata"
          />
        </label>
        <label>
          Minimum words
          <input
            defaultValue="1800"
            disabled={disabled || pending}
            min="1800"
            name="min_words"
            type="number"
          />
        </label>
      </div>
      <label>
        Save as
        <select defaultValue="draft" disabled={disabled || pending} name="status">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </label>
      <button className="button" disabled={disabled || pending}>
        {pending ? "Checking source..." : "Collect Source"}
      </button>

      {state.message ? (
        <div className={state.ok ? "notice success" : "notice"}>
          <strong>{state.message}</strong>
          {state.article ? (
            <p>
              {state.article.wordCount.toLocaleString()} words ·{" "}
              {state.article.license} · {state.article.author}
            </p>
          ) : null}
          {state.article ? (
            <Link className="button secondary" href={`/blog/${state.article.slug}`}>
              View Blog Post
            </Link>
          ) : null}
        </div>
      ) : null}
    </form>
  )
}
