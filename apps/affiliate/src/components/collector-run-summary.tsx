import type { CollectorRun } from "@/lib/types"

export function CollectorRunSummary({ runs }: { runs: CollectorRun[] }) {
  const collected = runs.filter((run) => run.status === "collected")
  const rejected = runs.filter((run) => run.status === "rejected")
  const averageWords =
    collected.length > 0
      ? Math.round(
          collected.reduce((sum, run) => sum + run.wordCount, 0) /
            collected.length
        )
      : 0
  const latest = runs[0]?.createdAt
    ? new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(runs[0].createdAt))
    : "No runs"

  return (
    <div className="report-metrics">
      <div className="metric">
        <strong>{collected.length}</strong>
        <span>Collected</span>
      </div>
      <div className="metric">
        <strong>{rejected.length}</strong>
        <span>Rejected</span>
      </div>
      <div className="metric">
        <strong>{averageWords.toLocaleString()}</strong>
        <span>Avg words</span>
      </div>
      <div className="metric">
        <strong>{latest}</strong>
        <span>Latest run</span>
      </div>
    </div>
  )
}
