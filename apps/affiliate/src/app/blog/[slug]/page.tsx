import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArticleBody } from "@/components/article-body"
import { SiteShell } from "@/components/site-shell"
import { getPostBySlug, getSiteSnapshot } from "@/lib/repository"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { post } = await getPostBySlug(slug)

  if (!post) {
    return {}
  }

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
  }
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [{ site, post }, snapshot] = await Promise.all([
    getPostBySlug(slug),
    getSiteSnapshot(),
  ])

  if (!post) {
    notFound()
  }

  return (
    <SiteShell site={site} categories={snapshot.categories}>
      <article className="detail-main">
        <div className="eyebrow">SEO Guide</div>
        <h1>{post.title}</h1>
        <p className="detail-copy">{post.excerpt}</p>
        <ArticleBody body={post.body} />
        {post.sourceUrl || post.sourceAuthor || post.sourceLicense ? (
          <div className="source-credit">
            <strong>Content credit</strong>
            <span>
              {post.sourceTitle || post.title}
              {post.sourceAuthor ? ` by ${post.sourceAuthor}` : ""}
            </span>
            <div>
              {post.sourceUrl ? <a href={post.sourceUrl}>Original source</a> : null}
              {post.sourceLicenseUrl ? (
                <a href={post.sourceLicenseUrl}>{post.sourceLicense || "License"}</a>
              ) : post.sourceLicense ? (
                <span>{post.sourceLicense}</span>
              ) : null}
            </div>
          </div>
        ) : null}
      </article>
    </SiteShell>
  )
}
