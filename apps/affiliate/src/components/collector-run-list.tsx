import Link from "next/link"
import type { CollectorRun } from "@/lib/types"

export function CollectorRunList({ runs }: { runs: CollectorRun[] }) {
  return (
    <div className="admin-panel">
      <h3>Collector History</h3>
      {runs.length > 0 ? (
        <div className="collector-run-list">
          {runs.map((run) => (
            <article className="collector-run-item" key={run.id}>
              <div>
                <strong>{run.title || run.sourceUrl}</strong>
                <span>
                  {run.status} · {run.wordCount.toLocaleString()} words
                  {run.license ? ` · ${run.license}` : ""}
                </span>
                <span>{run.message}</span>
                <a href={run.sourceUrl}>{run.sourceUrl}</a>
              </div>
              <div className="product-actions">
                {run.blogPostSlug ? (
                  <Link className="button secondary" href={`/blog/${run.blogPostSlug}`}>
                    View
                  </Link>
                ) : null}
                {run.licenseUrl ? (
                  <a className="button secondary" href={run.licenseUrl}>
                    License
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          No collector runs have been recorded for this site yet.
        </div>
      )}
    </div>
  )
}
