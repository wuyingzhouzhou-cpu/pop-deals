import Link from "next/link"
import { notFound } from "next/navigation"
import { BlogPostForm } from "@/components/blog-post-form"
import { SiteShell } from "@/components/site-shell"
import { getAdminPostById } from "@/lib/repository"

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { site, post, categories, databaseReady } = await getAdminPostById(id)

  if (!post) {
    notFound()
  }

  return (
    <SiteShell site={site} categories={categories}>
      <div className="section-head">
        <div>
          <h2>Edit SEO Post</h2>
          <p>Update article content and search metadata.</p>
        </div>
        <Link className="button secondary" href="/admin/blog">
          Back
        </Link>
      </div>
      <div className="admin-layout single">
        <BlogPostForm
          site={site}
          databaseReady={databaseReady}
          post={post}
        />
      </div>
    </SiteShell>
  )
}
