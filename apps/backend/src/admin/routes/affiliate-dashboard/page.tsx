"use client";

import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Button, Table, Badge } from "@medusajs/ui";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Stats Types                                                       */
/* ------------------------------------------------------------------ */

type StatsResponse = {
  totals: {
    total_clicks: number;
    total_views: number;
    unique_products: number;
    unique_visitors: number;
  };
  bySource: { source: string; count: number }[];
  byAffiliate: {
    affiliate_account: string;
    affiliate_id: string;
    platform_title: string;
    creator_username: string;
    count: number;
  }[];
  byDevice: { device_type: string; count: number }[];
  byCountry: { country_code: string; count: number }[];
  byProduct: { product_id: string; product_title: string; count: number }[];
  byViewedProduct: {
    product_id: string;
    product_title: string;
    count: number;
  }[];
  timeline: { date: string; count: number }[];
  recent: {
    id: number;
    product_id: string;
    product_title: string;
    source: string;
    platform_title: string;
    affiliate_id: string;
    account_user: string;
    creator_username: string;
    click_id: string;
    device_type: string;
    country_code: string;
    affiliate_url: string;
    created_at: string;
  }[];
};

type LinksResponse = {
  items: {
    id: string;
    title: string;
    handle: string;
    thumbnail: string | null;
    affiliate: AffiliateForm;
    links: Record<string, string>;
  }[];
  sources: string[];
  platforms: { value: string; label: string }[];
};

type AffiliateForm = {
  platform: string;
  platform_title: string;
  country: string;
  affiliate_id: string;
  account_user: string;
  url: string;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const fmt = (n: number) => n.toLocaleString();

const brandColor = "hsl(210, 60%, 50%)";

const Bar = ({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) => (
  <div className="flex items-center gap-2 text-small-regular">
    <span className="w-24 shrink-0 truncate text-right text-ui-fg-subtle">
      {label}
    </span>
    <div className="h-4 flex-1 overflow-hidden rounded-full bg-ui-bg-subtle">
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${max > 0 ? (value / max) * 100 : 0}%`,
          background: brandColor,
        }}
      />
    </div>
    <span className="w-14 text-right font-medium tabular-nums">
      {fmt(value)}
    </span>
  </div>
);

const StatCard = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="rounded-xl border border-ui-border-base bg-white p-5 shadow-sm">
    <p className="text-small-regular text-ui-fg-subtle">{label}</p>
    <p className="mt-1 text-[32px] font-semibold leading-none tracking-tight">
      {value}
    </p>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Range selector                                                    */
/* ------------------------------------------------------------------ */

const RangeSelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex gap-1 rounded-lg border border-ui-border-base p-0.5">
    {["7d", "30d", "90d"].map((r) => (
      <button
        key={r}
        onClick={() => onChange(r)}
        className={
          value === r
            ? "rounded-md bg-ui-bg-base px-3 py-1.5 text-small-semi shadow-sm"
            : "rounded-md px-3 py-1.5 text-small-regular text-ui-fg-subtle hover:text-ui-fg-base"
        }
      >
        {r}
      </button>
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Main Component                                                    */
/* ------------------------------------------------------------------ */

const AffiliateDashboard = () => {
  const [linksVersion, setLinksVersion] = useState(0);
  const [range, setRange] = useState("7d");
  const [tab, setTab] = useState<"stats" | "links">("stats");
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery<StatsResponse>({
    queryKey: ["affiliate-stats", range],
    queryFn: () =>
      fetch(`/admin/affiliate/stats?range=${range}`).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch stats");
        return r.json();
      }),
  });

  const { data: linksData, isLoading: linksLoading } = useQuery<LinksResponse>({
    queryKey: ["affiliate-links", linksVersion],
    queryFn: () =>
      fetch("/admin/affiliate/links").then((r) => {
        if (!r.ok) throw new Error("Failed to fetch links");
        return r.json();
      }),
  });

  const saveMutation = useMutation({
    mutationFn: (body: { id: string; affiliate: AffiliateForm }) =>
      fetch("/admin/affiliate/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to save");
        return r.json();
      }),
    onSuccess: () => {
      setLinksVersion((v) => v + 1);
      setEditingProduct(null);
    },
  });

  const emptyAffiliateForm: AffiliateForm = {
    platform: "",
    platform_title: "",
    country: "",
    affiliate_id: "",
    account_user: "",
    url: "",
  };
  const [affiliateForm, setAffiliateForm] =
    useState<AffiliateForm>(emptyAffiliateForm);
  const platforms = linksData?.platforms || [];

  const openLinkEditor = (productId: string) => {
    const item = linksData?.items.find((i) => i.id === productId);
    setAffiliateForm(
      item?.affiliate ? { ...item.affiliate } : emptyAffiliateForm
    );
    setEditingProduct(productId);
  };

  const updateAffiliateForm = (key: keyof AffiliateForm, value: string) => {
    const next = { ...affiliateForm, [key]: value };

    if (key === "platform") {
      const platform = platforms.find((p) => p.value === value);
      next.platform_title = platform?.label || value;
    }

    setAffiliateForm(next);
  };

  return (
    <Container className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Heading>Affiliate Dashboard</Heading>
        <div className="flex gap-2">
          <button
            onClick={() => setTab("stats")}
            className={
              tab === "stats"
                ? "rounded-lg bg-ui-bg-base px-4 py-2 text-small-semi shadow-sm"
                : "rounded-lg px-4 py-2 text-small-regular text-ui-fg-subtle hover:text-ui-fg-base"
            }
          >
            Stats
          </button>
          <button
            onClick={() => setTab("links")}
            className={
              tab === "links"
                ? "rounded-lg bg-ui-bg-base px-4 py-2 text-small-semi shadow-sm"
                : "rounded-lg px-4 py-2 text-small-regular text-ui-fg-subtle hover:text-ui-fg-base"
            }
          >
            Links
          </button>
        </div>
      </div>

      {/* ========================== STATS TAB ========================== */}
      {tab === "stats" && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <Heading level="h2" className="text-ui-fg-base">
              Click Analytics
            </Heading>
            <RangeSelect value={range} onChange={setRange} />
          </div>

          {statsLoading || !stats || !stats.totals ? (
            <div className="py-12 text-center text-ui-fg-subtle">
              {statsError ? "Failed to load stats." : "Loading stats..."}
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="mb-8 grid grid-cols-4 gap-4">
                <StatCard
                  label="Product Views"
                  value={fmt(stats.totals?.total_views || 0)}
                />
                <StatCard
                  label="Total Clicks"
                  value={fmt(stats.totals?.total_clicks || 0)}
                />
                <StatCard
                  label="Products Clicked"
                  value={fmt(stats.totals?.unique_products || 0)}
                />
                <StatCard
                  label="Unique Visitors"
                  value={fmt(stats.totals?.unique_visitors || 0)}
                />
              </div>

              {/* Timeline */}
              {stats.timeline.length > 0 && (
                <div className="mb-8">
                  <Heading level="h2" className="mb-3 text-ui-fg-base">
                    Clicks Over Time
                  </Heading>
                  <div className="rounded-xl border border-ui-border-base bg-white p-5">
                    <div className="flex items-end gap-1">
                      {stats.timeline.map((d) => {
                        const max = Math.max(
                          ...stats.timeline.map((t) => t.count)
                        );
                        const h = max > 0 ? (d.count / max) * 160 : 0;
                        return (
                          <div
                            key={d.date}
                            className="flex flex-1 flex-col items-center gap-1"
                          >
                            <span className="text-[10px] text-ui-fg-subtle">
                              {d.count}
                            </span>
                            <div
                              className="w-full rounded-t"
                              style={{
                                height: h,
                                background: "hsla(210, 60%, 50%, 0.7)",
                              }}
                            />
                            <span className="text-[9px] text-ui-fg-muted">
                              {new Date(d.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6 grid grid-cols-2 gap-6">
                {/* By Source */}
                <div className="rounded-xl border border-ui-border-base bg-white p-5">
                  <Heading level="h2" className="mb-4 text-ui-fg-base">
                    By Source
                  </Heading>
                  <div className="space-y-2">
                    {stats.bySource.map((s) => (
                      <Bar
                        key={s.source}
                        label={s.source || "unknown"}
                        value={s.count}
                        max={stats.bySource[0]?.count || 1}
                      />
                    ))}
                    {stats.bySource.length === 0 && (
                      <p className="text-small-regular text-ui-fg-subtle">
                        No data yet
                      </p>
                    )}
                  </div>
                </div>

                {/* By Device */}
                <div className="rounded-xl border border-ui-border-base bg-white p-5">
                  <Heading level="h2" className="mb-4 text-ui-fg-base">
                    By Device
                  </Heading>
                  <div className="space-y-2">
                    {stats.byDevice.map((d) => (
                      <Bar
                        key={d.device_type}
                        label={d.device_type || "unknown"}
                        value={d.count}
                        max={stats.byDevice[0]?.count || 1}
                      />
                    ))}
                    {stats.byDevice.length === 0 && (
                      <p className="text-small-regular text-ui-fg-subtle">
                        No data yet
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {stats.byAffiliate.length > 0 && (
                <div className="mb-8">
                  <Heading level="h2" className="mb-3 text-ui-fg-base">
                    By Affiliate Account
                  </Heading>
                  <div className="rounded-xl border border-ui-border-base bg-white p-5">
                    <div className="space-y-2">
                      {stats.byAffiliate.map((a) => (
                        <Bar
                          key={a.affiliate_account}
                          label={
                            a.affiliate_account ||
                            a.affiliate_id ||
                            a.creator_username ||
                            a.platform_title ||
                            "unknown"
                          }
                          value={a.count}
                          max={stats.byAffiliate[0]?.count || 1}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* By Country */}
              {stats.byCountry.length > 0 && (
                <div className="mb-8">
                  <Heading level="h2" className="mb-3 text-ui-fg-base">
                    Top Countries
                  </Heading>
                  <div className="rounded-xl border border-ui-border-base bg-white p-5">
                    <div className="space-y-2">
                      {stats.byCountry.map((c) => (
                        <Bar
                          key={c.country_code}
                          label={c.country_code || "unknown"}
                          value={c.count}
                          max={stats.byCountry[0]?.count || 1}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Top Products */}
              {stats.byProduct.length > 0 && (
                <div className="mb-8">
                  <Heading level="h2" className="mb-3 text-ui-fg-base">
                    Top Products
                  </Heading>
                  <div className="rounded-xl border border-ui-border-base bg-white p-5">
                    <div className="space-y-2">
                      {stats.byProduct.map((p) => (
                        <Bar
                          key={p.product_id}
                          label={p.product_title || p.product_id.slice(0, 12)}
                          value={p.count}
                          max={stats.byProduct[0]?.count || 1}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Recent clicks table */}
              <div>
                <Heading level="h2" className="mb-3 text-ui-fg-base">
                  Recent Clicks
                </Heading>
                <div className="overflow-x-auto rounded-xl border border-ui-border-base bg-white">
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>Click ID</Table.HeaderCell>
                        <Table.HeaderCell>Product</Table.HeaderCell>
                        <Table.HeaderCell>Platform</Table.HeaderCell>
                        <Table.HeaderCell>Affiliate</Table.HeaderCell>
                        <Table.HeaderCell>Creator</Table.HeaderCell>
                        <Table.HeaderCell>Device</Table.HeaderCell>
                        <Table.HeaderCell>Country</Table.HeaderCell>
                        <Table.HeaderCell>Time</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {stats.recent.slice(0, 20).map((c) => (
                        <Table.Row key={c.id}>
                          <Table.Cell className="max-w-[170px] truncate font-mono text-ui-fg-subtle">
                            {c.click_id || "-"}
                          </Table.Cell>
                          <Table.Cell className="max-w-[200px] truncate">
                            {c.product_title || c.product_id.slice(0, 16)}
                          </Table.Cell>
                          <Table.Cell>
                            {c.source ? (
                              <Badge size="small" color="blue">
                                {c.platform_title || c.source}
                              </Badge>
                            ) : (
                              <span className="text-ui-fg-muted">-</span>
                            )}
                          </Table.Cell>
                          <Table.Cell className="max-w-[180px] truncate text-ui-fg-subtle">
                            {c.account_user || c.affiliate_id || "-"}
                          </Table.Cell>
                          <Table.Cell className="max-w-[160px] truncate text-ui-fg-subtle">
                            {c.creator_username || "-"}
                          </Table.Cell>
                          <Table.Cell className="capitalize">
                            {c.device_type || "-"}
                          </Table.Cell>
                          <Table.Cell>{c.country_code || "-"}</Table.Cell>
                          <Table.Cell className="whitespace-nowrap text-ui-fg-subtle">
                            {new Date(c.created_at).toLocaleString()}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                  {stats.recent.length === 0 && (
                    <div className="py-8 text-center text-ui-fg-subtle">
                      No clicks recorded yet
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ========================== LINKS TAB ========================== */}
      {tab === "links" && (
        <>
          <Heading level="h2" className="mb-4 text-ui-fg-base">
            Manage Affiliate Product Info
          </Heading>
          <p className="mb-4 max-w-3xl text-small-regular text-ui-fg-subtle">
            These fields are saved on product metadata. The storefront uses
            Landing URL as the primary Buy Now destination.
          </p>

          {linksLoading ? (
            <div className="py-12 text-center text-ui-fg-subtle">
              Loading products...
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-ui-border-base bg-white">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Product</Table.HeaderCell>
                    <Table.HeaderCell>Platform</Table.HeaderCell>
                    <Table.HeaderCell>Country</Table.HeaderCell>
                    <Table.HeaderCell>Affiliate ID</Table.HeaderCell>
                    <Table.HeaderCell>Account User</Table.HeaderCell>
                    <Table.HeaderCell>Landing URL</Table.HeaderCell>
                    <Table.HeaderCell className="text-right">
                      Actions
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {linksData?.items.map((item) => {
                    const isEditing = editingProduct === item.id;
                    return (
                      <Table.Row key={item.id}>
                        <Table.Cell>
                          <div className="flex items-center gap-2">
                            {item.thumbnail && (
                              <img
                                src={item.thumbnail}
                                alt=""
                                className="h-8 w-8 rounded object-cover"
                              />
                            )}
                            <span className="font-medium">{item.title}</span>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="min-w-[150px]">
                          {isEditing ? (
                            <select
                              className="w-full rounded border border-ui-border-base px-2 py-1 text-small-regular"
                              value={affiliateForm.platform}
                              onChange={(e) =>
                                updateAffiliateForm("platform", e.target.value)
                              }
                            >
                              <option value="">Select platform</option>
                              {platforms.map((platform) => (
                                <option
                                  key={platform.value}
                                  value={platform.value}
                                >
                                  {platform.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <Badge size="small" color="blue">
                              {item.affiliate.platform_title ||
                                item.affiliate.platform ||
                                "Not set"}
                            </Badge>
                          )}
                        </Table.Cell>
                        <Table.Cell className="min-w-[110px]">
                          {isEditing ? (
                            <input
                              className="w-full rounded border border-ui-border-base px-2 py-1 text-small-regular"
                              placeholder="US, DK, CN..."
                              value={affiliateForm.country}
                              onChange={(e) =>
                                updateAffiliateForm("country", e.target.value)
                              }
                            />
                          ) : (
                            <span className="uppercase text-ui-fg-subtle">
                              {item.affiliate.country || "-"}
                            </span>
                          )}
                        </Table.Cell>
                        <Table.Cell className="min-w-[150px]">
                          {isEditing ? (
                            <input
                              className="w-full rounded border border-ui-border-base px-2 py-1 text-small-regular"
                              placeholder="Affiliate ID"
                              value={affiliateForm.affiliate_id}
                              onChange={(e) =>
                                updateAffiliateForm(
                                  "affiliate_id",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            <span className="block truncate text-ui-fg-subtle">
                              {item.affiliate.affiliate_id || "-"}
                            </span>
                          )}
                        </Table.Cell>
                        <Table.Cell className="min-w-[160px]">
                          {isEditing ? (
                            <input
                              className="w-full rounded border border-ui-border-base px-2 py-1 text-small-regular"
                              placeholder="Account user"
                              value={affiliateForm.account_user}
                              onChange={(e) =>
                                updateAffiliateForm(
                                  "account_user",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            <span className="block truncate text-ui-fg-subtle">
                              {item.affiliate.account_user || "-"}
                            </span>
                          )}
                        </Table.Cell>
                        <Table.Cell className="min-w-[260px] max-w-[360px]">
                          {isEditing ? (
                            <input
                              className="w-full rounded border border-ui-border-base px-2 py-1 text-small-regular"
                              placeholder="https://..."
                              value={affiliateForm.url}
                              onChange={(e) =>
                                updateAffiliateForm("url", e.target.value)
                              }
                            />
                          ) : (
                            <span className="block truncate text-ui-fg-subtle">
                              {item.affiliate.url || "-"}
                            </span>
                          )}
                        </Table.Cell>
                        <Table.Cell className="text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-1">
                              <Button
                                size="small"
                                onClick={() =>
                                  saveMutation.mutate({
                                    id: item.id,
                                    affiliate: affiliateForm,
                                  })
                                }
                              >
                                Save
                              </Button>
                              <Button
                                size="small"
                                variant="secondary"
                                onClick={() => setEditingProduct(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="small"
                              variant="secondary"
                              onClick={() => openLinkEditor(item.id)}
                            >
                              Edit
                            </Button>
                          )}
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
              {(!linksData?.items || linksData.items.length === 0) && (
                <div className="py-8 text-center text-ui-fg-subtle">
                  No products found
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Affiliate",
});

export default AffiliateDashboard;
