export function ArticleBody({ body }: { body: string }) {
  const blocks = body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)

  return (
    <div className="article-body">
      {blocks.map((block) =>
        block.startsWith("## ") ? (
          <h2 key={block}>{block.replace(/^##\s+/, "")}</h2>
        ) : (
          <p key={block}>{block}</p>
        )
      )}
    </div>
  )
}
