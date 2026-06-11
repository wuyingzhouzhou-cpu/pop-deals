import Link from "next/link"
import {
  categoriesForSection,
  childCategories,
  navSections,
  topLevelCategories,
} from "@/lib/category-navigation"
import type { Category, Site } from "@/lib/types"

export function SiteShell({
  site,
  categories,
  children,
}: {
  site: Site
  categories: Category[]
  children: React.ReactNode
}) {
  const shellStyle = site.themeColor
    ? ({ "--accent": site.themeColor } as React.CSSProperties)
    : undefined
  const showAdminLink = process.env.NODE_ENV !== "production"

  return (
    <div className="site-shell" style={shellStyle}>
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" href="/">
            {site.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="brand-logo" src={site.logoUrl} alt="" />
            ) : null}
            <strong>{site.name}</strong>
            <span>{site.domain}</span>
          </Link>
          <nav className="nav-links" aria-label="Main navigation">
            <Link href="/">Deals</Link>
            {navSections.map((section) => {
              const sectionCategories = categoriesForSection(
                categories,
                section.key
              )
              const topCategories = topLevelCategories(sectionCategories)

              return (
                <div className="nav-item" key={section.key}>
                  <Link href={`/?section=${section.key}`}>{section.label}</Link>
                  <div className="nav-menu">
                    {topCategories.length > 0 ? (
                      topCategories.map((category) => {
                        const children = childCategories(
                          sectionCategories,
                          category.id
                        )

                        return (
                          <div className="nav-menu-group" key={category.id}>
                            <Link href={`/?category=${category.slug}`}>
                              {category.name}
                            </Link>
                            {children.length > 0 ? (
                              <div className="nav-submenu">
                                {children.map((child) => (
                                  <Link
                                    key={child.id}
                                    href={`/?category=${child.slug}`}
                                  >
                                    {child.name}
                                  </Link>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        )
                      })
                    ) : (
                      <span className="nav-menu-empty">Coming soon</span>
                    )}
                  </div>
                </div>
              )
            })}
            <Link href="/blog">Blog</Link>
            {showAdminLink ? <Link href="/admin">Admin</Link> : null}
          </nav>
        </div>
      </header>
      <main className="page">{children}</main>
      <footer className="site-footer">
        <div className="site-footer-inner">
          <span>{site.name}</span>
          <nav aria-label="Footer navigation">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/affiliate-disclosure">Affiliate Disclosure</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
