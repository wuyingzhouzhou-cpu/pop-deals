import type { BlogPost, Site } from "@/lib/types"
import { createBlogPostAction, updateBlogPostAction } from "@/app/admin/actions"

export function BlogPostForm({
  site,
  databaseReady,
  post,
}: {
  site: Site
  databaseReady: boolean
  post?: BlogPost
}) {
  const action = post ? updateBlogPostAction : createBlogPostAction

  return (
    <form className="admin-form" action={action}>
      <h3>{post ? "Edit SEO Post" : "Add SEO Post"}</h3>
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <input type="hidden" name="site_id" value={site.id} />
      <label>
        Title
        <input name="title" defaultValue={post?.title || ""} required />
      </label>
      <label>
        Slug
        <input
          name="slug"
          defaultValue={post?.slug || ""}
          placeholder="auto-generated if empty"
        />
      </label>
      <label>
        SEO title
        <input
          name="seo_title"
          defaultValue={post?.seoTitle || ""}
          placeholder="Optional search result title"
        />
      </label>
      <label>
        SEO description
        <textarea
          name="seo_description"
          defaultValue={post?.seoDescription || ""}
          placeholder="Optional search result description"
          rows={3}
        />
      </label>
      <label>
        Excerpt
        <textarea name="excerpt" defaultValue={post?.excerpt || ""} rows={3} />
      </label>
      <label>
        Body
        <textarea name="body" defaultValue={post?.body || ""} rows={8} />
      </label>
      <div className="form-row">
        <label>
          Source title
          <input
            name="source_title"
            defaultValue={post?.sourceTitle || ""}
            placeholder="Original article title"
          />
        </label>
        <label>
          Source URL
          <input
            name="source_url"
            defaultValue={post?.sourceUrl || ""}
            placeholder="https://..."
          />
        </label>
        <label>
          Source author
          <input
            name="source_author"
            defaultValue={post?.sourceAuthor || ""}
            placeholder="Author or organization"
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          License
          <input
            name="source_license"
            defaultValue={post?.sourceLicense || ""}
            placeholder="CC BY 4.0, Public Domain, Original"
          />
        </label>
        <label>
          License URL
          <input
            name="source_license_url"
            defaultValue={post?.sourceLicenseUrl || ""}
            placeholder="https://creativecommons.org/licenses/by/4.0/"
          />
        </label>
      </div>
      <label>
        Status
        <select name="status" defaultValue={post?.status || "published"}>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </label>
      <button className="button" disabled={!databaseReady}>
        {post ? "Update Post" : "Save Post"}
      </button>
    </form>
  )
}
