import Link from "next/link"
import { deleteBlogPostAction } from "@/app/admin/actions"
import type { BlogPost } from "@/lib/types"

export function BlogPostAdminList({
  posts,
  databaseReady,
}: {
  posts: BlogPost[]
  databaseReady: boolean
}) {
  return (
    <div className="admin-panel">
      <h3>Posts</h3>
      <div className="product-admin-list">
        {posts.map((post) => (
          <article className="product-admin-item" key={post.id}>
            <div>
              <strong>{post.title}</strong>
              <span>
                {post.status} · /blog/{post.slug}
                {post.seoTitle ? ` · SEO title set` : ""}
                {post.sourceLicense ? ` · ${post.sourceLicense}` : ""}
              </span>
            </div>
            <div className="product-actions">
              <Link className="button secondary" href={`/admin/blog/${post.id}`}>
                Edit
              </Link>
              <Link className="button secondary" href={`/blog/${post.slug}`}>
                View
              </Link>
              <form action={deleteBlogPostAction}>
                <input type="hidden" name="id" value={post.id} />
                <button className="button danger" disabled={!databaseReady}>
                  Delete
                </button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
