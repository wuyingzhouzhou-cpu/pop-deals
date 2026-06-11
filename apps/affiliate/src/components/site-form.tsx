import type { Site } from "@/lib/types"
import { createSiteAction, updateSiteAction } from "@/app/admin/actions"

export function SiteForm({
  databaseReady,
  site,
}: {
  databaseReady: boolean
  site?: Site
}) {
  const action = site ? updateSiteAction : createSiteAction

  return (
    <form className="admin-form" action={action}>
      <h3>{site ? "Edit Site" : "Add Site"}</h3>
      {site ? <input type="hidden" name="id" value={site.id} /> : null}
      <label>
        Site name
        <input
          name="name"
          defaultValue={site?.name || ""}
          placeholder="Pop Deals"
          required
        />
      </label>
      <label>
        Primary domain
        <input
          name="domain"
          defaultValue={site?.domain || ""}
          placeholder="deals.example.com"
          required
        />
      </label>
      <label>
        Alias domains
        <textarea
          name="alias_domains"
          defaultValue={(site?.aliasDomains || []).join("\n")}
          placeholder="www.example.com&#10;example.net"
          rows={3}
        />
      </label>
      <div className="form-row">
        <label>
          Locale
          <input name="locale" defaultValue={site?.locale || "en-US"} />
        </label>
        <label>
          Country
          <input name="country" defaultValue={site?.country || "US"} />
        </label>
        <label>
          Currency
          <input name="currency" defaultValue={site?.currency || "USD"} />
        </label>
      </div>
      <div className="form-row">
        <label>
          Logo URL
          <input
            name="logo_url"
            defaultValue={site?.logoUrl || ""}
            placeholder="https://..."
          />
        </label>
        <label>
          Theme color
          <input
            name="theme_color"
            defaultValue={site?.themeColor || "#c83d2d"}
            placeholder="#c83d2d"
          />
        </label>
        <label>
          SEO title
          <input
            name="seo_title"
            defaultValue={site?.seoTitle || ""}
            placeholder="Pop Deals"
          />
        </label>
      </div>
      <label>
        SEO description
        <textarea
          name="seo_description"
          defaultValue={site?.seoDescription || ""}
          rows={3}
          placeholder="Default search description for this site."
        />
      </label>
      <label>
        Homepage description
        <textarea
          name="description"
          defaultValue={site?.description || ""}
          rows={4}
          placeholder="Hand-picked deals and shopping guides..."
        />
      </label>
      <button className="button" disabled={!databaseReady}>
        {site ? "Update Site" : "Save Site"}
      </button>
    </form>
  )
}
