type LegalSection = {
  title: string
  body: string
}

export function LegalPage({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow: string
  title: string
  intro: string
  sections: LegalSection[]
}) {
  return (
    <article className="detail-main legal-page">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p className="detail-copy">{intro}</p>
      <div className="article-body">
        {sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  )
}
