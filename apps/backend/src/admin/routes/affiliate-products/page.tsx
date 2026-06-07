"use client";

import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Badge, Button, Container, Heading, Table } from "@medusajs/ui";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

type AffiliateForm = {
  platform: string;
  platform_title: string;
  country: string;
  affiliate_id: string;
  account_user: string;
  creator_username: string;
  url: string;
};

type ProductItem = {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  category_id: string;
  affiliate: AffiliateForm;
};

type LinksResponse = {
  items: ProductItem[];
  platforms: { value: string; label: string }[];
  categories: {
    id: string;
    name: string;
    handle: string;
    parent_category_id: string;
  }[];
};

type ProductForm = {
  title: string;
  description: string;
  thumbnail: string;
  price: string;
  currency_code: string;
  sku: string;
  category_id: string;
  category_handle?: string;
  category?: string;
  original_price_text?: string;
  external_product_id?: string;
  shop_name?: string;
  seller_id?: string;
  commission_rate?: string;
  earn_amount?: string;
  sales?: string;
  product_rating?: string;
};

const emptyAffiliateForm: AffiliateForm = {
  platform: "",
  platform_title: "",
  country: "",
  affiliate_id: "",
  account_user: "",
  creator_username: "",
  url: "",
};

const emptyProductForm: ProductForm = {
  title: "",
  description: "",
  thumbnail: "",
  price: "",
  currency_code: "usd",
  sku: "",
  category_id: "",
};

const AffiliateProductManager = () => {
  const [version, setVersion] = useState(0);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<
    { product: ProductForm; affiliate: AffiliateForm }[]
  >([]);
  const [form, setForm] = useState<AffiliateForm>(emptyAffiliateForm);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);

  const { data, isLoading } = useQuery<LinksResponse>({
    queryKey: ["affiliate-product-manager", version],
    queryFn: () =>
      fetch("/admin/affiliate/links", { credentials: "include" }).then((r) => {
        if (!r.ok) throw new Error("Failed to load affiliate products");
        return r.json();
      }),
  });

  const saveMutation = useMutation({
    mutationFn: (body: {
      id?: string;
      product?: ProductForm;
      products?: { product: ProductForm; affiliate: AffiliateForm }[];
      affiliate: AffiliateForm;
    }) =>
      fetch("/admin/affiliate/links", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(async (r) => {
        const data = await r.json().catch(() => null);

        if (!r.ok) {
          throw new Error(data?.message || "Failed to save affiliate product");
        }

        return data;
      }),
    onSuccess: () => {
      setVersion((v) => v + 1);
      setEditingProduct(null);
      setForm(emptyAffiliateForm);
      setProductForm(emptyProductForm);
      setCreateOpen(false);
    },
    onError: (err) => {
      alert(
        "Save failed: " + (err instanceof Error ? err.message : "Unknown error")
      );
    },
  });

  const platforms = data?.platforms || [];
  const categories = data?.categories || [];
  const parentCategories = categories.filter(
    (category) => !category.parent_category_id
  );
  const childCategories = categories.filter(
    (category) => category.parent_category_id
  );

  const openEdit = (item: ProductItem) => {
    setEditingProduct(item.id);
    setForm(item.affiliate ? { ...item.affiliate } : emptyAffiliateForm);
    setProductForm({
      ...emptyProductForm,
      category_id: item.category_id || "",
    });
  };

  const updateForm = (key: keyof AffiliateForm, value: string) => {
    const next = { ...form, [key]: value };

    if (key === "platform") {
      const platform = platforms.find((p) => p.value === value);
      next.platform_title = platform?.label || value;
    }

    setForm(next);
  };

  const updateProductForm = (key: keyof ProductForm, value: string) => {
    setProductForm({ ...productForm, [key]: value });
  };

  const createGuideProduct = () => {
    if (!productForm.title.trim()) {
      alert("Product title is required");
      return;
    }

    if (!form.url.trim()) {
      alert("Landing URL is required");
      return;
    }

    saveMutation.mutate({
      product: productForm,
      affiliate: form,
    });
  };

  const renderCategoryOptions = () => (
    <>
      {parentCategories.map((parent) => {
        const children = childCategories.filter(
          (child) => child.parent_category_id === parent.id
        );

        return (
          <optgroup key={parent.id} label={parent.name}>
            <option value={parent.id}>{parent.name}</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                -- {child.name}
              </option>
            ))}
          </optgroup>
        );
      })}
      {childCategories
        .filter(
          (child) =>
            !parentCategories.some(
              (parent) => parent.id === child.parent_category_id
            )
        )
        .map((child) => (
          <option key={child.id} value={child.id}>
            {child.name}
          </option>
        ))}
    </>
  );

  const readCell = (row: Record<string, string>, keys: string[]) => {
    for (const key of keys) {
      const value = row[key.toLowerCase()];

      if (value) {
        return value.trim();
      }
    }

    return "";
  };

  const parseDelimitedImport = (text: string) => {
    const delimiter = text.includes("\t") ? "\t" : ",";
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      return [];
    }

    const parseLine = (line: string) => {
      const values: string[] = [];
      let current = "";
      let quoted = false;

      for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        const next = line[i + 1];

        if (char === '"' && next === '"') {
          current += '"';
          i += 1;
        } else if (char === '"') {
          quoted = !quoted;
        } else if (char === delimiter && !quoted) {
          values.push(current);
          current = "";
        } else {
          current += char;
        }
      }

      values.push(current);
      return values.map((value) => value.trim());
    };

    const headers = parseLine(lines[0]).map((header) =>
      header.trim().toLowerCase()
    );

    return lines.slice(1).flatMap((line) => {
      const values = parseLine(line);
      const row = headers.reduce(
        (acc, header, index) => ({
          ...acc,
          [header]: values[index] || "",
        }),
        {} as Record<string, string>
      );
      const platform = readCell(row, ["platform", "source"]);
      const platformConfig = platforms.find(
        (p) =>
          p.value === platform ||
          p.label.toLowerCase() === platform.toLowerCase()
      );
      const title = readCell(row, ["title", "product_title", "name"]);
      const url = readCell(row, ["landing_url", "url", "affiliate_url"]);

      if (!title || !url) {
        return [];
      }

      return [
        {
          product: {
            title,
            description: readCell(row, ["description", "desc"]),
            thumbnail: readCell(row, ["image_url", "thumbnail", "image"]),
            price: readCell(row, ["price", "amount"]),
            currency_code:
              readCell(row, ["currency", "currency_code"]) || "usd",
            sku: readCell(row, ["sku"]),
            category_id: readCell(row, ["category_id"]),
            category_handle: readCell(row, ["category_handle"]),
            category: readCell(row, ["category", "category_name"]),
            original_price_text: readCell(row, [
              "tiktok_price_text",
              "original_price_text",
              "format_price",
            ]),
            external_product_id: readCell(row, [
              "tiktok_product_id",
              "external_product_id",
              "product_id",
            ]),
            shop_name: readCell(row, ["shop_name", "store_name"]),
            seller_id: readCell(row, ["seller_id"]),
            commission_rate: readCell(row, ["commission_rate"]),
            earn_amount: readCell(row, ["earn_amount"]),
            sales: readCell(row, ["sales"]),
            product_rating: readCell(row, ["product_rating", "rating"]),
          },
          affiliate: {
            platform: platformConfig?.value || platform,
            platform_title: platformConfig?.label || platform,
            country: readCell(row, ["country", "country_code"]),
            affiliate_id: readCell(row, ["affiliate_id", "affiliateid"]),
            account_user: readCell(row, ["account_user", "account", "user"]),
            creator_username: readCell(row, [
              "creator_username",
              "tiktok_creator",
              "influencer_username",
              "mcn_creator",
            ]),
            url,
          },
        },
      ];
    });
  };

  const importProducts = () => {
    if (!importRows.length) {
      alert("No valid rows found. Title and Landing URL are required.");
      return;
    }

    saveMutation.mutate({
      products: importRows,
      affiliate: emptyAffiliateForm,
    });
  };

  if (isLoading) {
    return (
      <Container className="p-8 text-center text-ui-fg-subtle">
        Loading affiliate products...
      </Container>
    );
  }

  return (
    <Container className="p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Heading>Affiliate Product Manager</Heading>
          <p className="mt-2 max-w-3xl text-small-regular text-ui-fg-subtle">
            Add and manage affiliate products from one place. The storefront
            only displays products configured here.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setImportOpen((open) => !open);
              setCreateOpen(false);
              setEditingProduct(null);
            }}
          >
            {importOpen ? "Close Import" : "Import CSV"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setCreateOpen((open) => !open);
              setImportOpen(false);
              setEditingProduct(null);
              setForm(emptyAffiliateForm);
              setProductForm(emptyProductForm);
            }}
          >
            {createOpen ? "Close" : "Add Guide Product"}
          </Button>
        </div>
      </div>

      {importOpen && (
        <div className="mb-6 rounded-xl border border-ui-border-base bg-white p-5">
          <Heading level="h2" className="mb-3 text-ui-fg-base">
            Import guide products
          </Heading>
          <p className="mb-4 text-small-regular text-ui-fg-subtle">
            Export from Excel as CSV or TSV. Required columns: title,
            landing_url. Optional columns: description, image_url, price,
            currency, sku, platform, country, affiliate_id, account_user,
            creator_username (TikTok MCN only), category, category_handle,
            category_id.
          </p>
          <input
            type="file"
            accept=".csv,.tsv,.txt"
            className="block w-full rounded border border-ui-border-base px-3 py-2 text-small-regular"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (!file) {
                return;
              }

              const reader = new FileReader();
              reader.onload = () => {
                const bytes = new Uint8Array(reader.result as ArrayBuffer);
                let text = "";

                try {
                  text = new TextDecoder("utf-8", { fatal: true }).decode(
                    bytes
                  );
                } catch {
                  text = new TextDecoder("gb18030").decode(bytes);
                }

                setImportRows(parseDelimitedImport(text));
              };
              reader.readAsArrayBuffer(file);
            }}
          />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-small-regular text-ui-fg-subtle">
              {importRows.length} valid rows ready
            </span>
            <Button onClick={importProducts}>Import Products</Button>
          </div>
        </div>
      )}

      {createOpen && (
        <div className="mb-6 rounded-xl border border-ui-border-base bg-white p-5">
          <Heading level="h2" className="mb-4 text-ui-fg-base">
            New guide product
          </Heading>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                Product title
              </label>
              <input
                className="w-full rounded border border-ui-border-base px-3 py-2 text-small-regular"
                placeholder="e.g. Portable Mechanical Keyboard"
                value={productForm.title}
                onChange={(e) => updateProductForm("title", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                SKU
              </label>
              <input
                className="w-full rounded border border-ui-border-base px-3 py-2 text-small-regular"
                placeholder="Optional internal SKU"
                value={productForm.sku}
                onChange={(e) => updateProductForm("sku", e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                Description
              </label>
              <textarea
                className="w-full rounded border border-ui-border-base px-3 py-2 text-small-regular"
                rows={3}
                placeholder="Short deal description shown on the detail page"
                value={productForm.description}
                onChange={(e) =>
                  updateProductForm("description", e.target.value)
                }
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                Image URL
              </label>
              <input
                className="w-full rounded border border-ui-border-base px-3 py-2 text-small-regular"
                placeholder="https://..."
                value={productForm.thumbnail}
                onChange={(e) => updateProductForm("thumbnail", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                Price
              </label>
              <input
                className="w-full rounded border border-ui-border-base px-3 py-2 text-small-regular"
                placeholder="19.99"
                value={productForm.price}
                onChange={(e) => updateProductForm("price", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                Currency
              </label>
              <input
                className="w-full rounded border border-ui-border-base px-3 py-2 text-small-regular"
                placeholder="usd"
                value={productForm.currency_code}
                onChange={(e) =>
                  updateProductForm("currency_code", e.target.value)
                }
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                Affiliate category
              </label>
              <select
                className="w-full rounded border border-ui-border-base px-3 py-2 text-small-regular"
                value={productForm.category_id}
                onChange={(e) =>
                  updateProductForm("category_id", e.target.value)
                }
              >
                <option value="">No category</option>
                {renderCategoryOptions()}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                Platform
              </label>
              <select
                className="w-full rounded border border-ui-border-base px-3 py-2 text-small-regular"
                value={form.platform}
                onChange={(e) => updateForm("platform", e.target.value)}
              >
                <option value="">Select platform</option>
                {platforms.map((platform) => (
                  <option key={platform.value} value={platform.value}>
                    {platform.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                Country
              </label>
              <input
                className="w-full rounded border border-ui-border-base px-3 py-2 text-small-regular"
                placeholder="US, DK, CN..."
                value={form.country}
                onChange={(e) => updateForm("country", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                Affiliate ID
              </label>
              <input
                className="w-full rounded border border-ui-border-base px-3 py-2 text-small-regular"
                placeholder="Affiliate ID"
                value={form.affiliate_id}
                onChange={(e) => updateForm("affiliate_id", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                Account User
              </label>
              <input
                className="w-full rounded border border-ui-border-base px-3 py-2 text-small-regular"
                placeholder="Account user"
                value={form.account_user}
                onChange={(e) => updateForm("account_user", e.target.value)}
              />
            </div>
            {form.platform === "tiktok_shop" && (
              <div className="col-span-2">
                <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                  TikTok Creator Username
                  <span className="ml-2 rounded bg-ui-bg-subtle px-2 py-0.5 text-[10px] font-semibold uppercase text-ui-fg-subtle">
                    MCN only
                  </span>
                </label>
                <input
                  className="w-full rounded border border-ui-border-base px-3 py-2 text-small-regular"
                  placeholder="@creator_username"
                  value={form.creator_username}
                  onChange={(e) =>
                    updateForm("creator_username", e.target.value)
                  }
                />
              </div>
            )}
            <div className="col-span-2">
              <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                Landing URL
              </label>
              <input
                className="w-full rounded border border-ui-border-base px-3 py-2 text-small-regular"
                placeholder="https://..."
                value={form.url}
                onChange={(e) => updateForm("url", e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setCreateOpen(false);
                setProductForm(emptyProductForm);
                setForm(emptyAffiliateForm);
              }}
            >
              Cancel
            </Button>
            <Button onClick={createGuideProduct}>Create Guide Product</Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-ui-border-base bg-white">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Product</Table.HeaderCell>
              <Table.HeaderCell>Platform</Table.HeaderCell>
              <Table.HeaderCell>Category</Table.HeaderCell>
              <Table.HeaderCell>Country</Table.HeaderCell>
              <Table.HeaderCell>Affiliate ID</Table.HeaderCell>
              <Table.HeaderCell>Account User</Table.HeaderCell>
              <Table.HeaderCell>
                Creator
                <span className="ml-2 rounded bg-ui-bg-subtle px-2 py-0.5 text-[10px] font-semibold uppercase text-ui-fg-subtle">
                  MCN only
                </span>
              </Table.HeaderCell>
              <Table.HeaderCell>Landing URL</Table.HeaderCell>
              <Table.HeaderCell className="text-right">
                Actions
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {(data?.items || []).map((item) => {
              const isEditing = editingProduct === item.id;

              return (
                <Table.Row key={item.id}>
                  <Table.Cell className="min-w-[260px]">
                    <div className="flex items-center gap-2">
                      {item.thumbnail && (
                        <img
                          src={item.thumbnail}
                          alt=""
                          className="h-9 w-9 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xsmall-regular text-ui-fg-subtle">
                          /products/{item.handle}
                        </p>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="min-w-[150px]">
                    {isEditing ? (
                      <select
                        className="w-full rounded border border-ui-border-base px-2 py-1 text-small-regular"
                        value={form.platform}
                        onChange={(e) => updateForm("platform", e.target.value)}
                      >
                        <option value="">Select platform</option>
                        {platforms.map((platform) => (
                          <option key={platform.value} value={platform.value}>
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
                  <Table.Cell className="min-w-[180px]">
                    {isEditing ? (
                      <select
                        className="w-full rounded border border-ui-border-base px-2 py-1 text-small-regular"
                        value={productForm.category_id}
                        onChange={(e) =>
                          updateProductForm("category_id", e.target.value)
                        }
                      >
                        <option value="">No category</option>
                        {renderCategoryOptions()}
                      </select>
                    ) : (
                      categories.find(
                        (category) => category.id === item.category_id
                      )?.name || "-"
                    )}
                  </Table.Cell>
                  <Table.Cell className="min-w-[110px]">
                    {isEditing ? (
                      <input
                        className="w-full rounded border border-ui-border-base px-2 py-1 text-small-regular"
                        placeholder="US"
                        value={form.country}
                        onChange={(e) => updateForm("country", e.target.value)}
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
                        value={form.affiliate_id}
                        onChange={(e) =>
                          updateForm("affiliate_id", e.target.value)
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
                        value={form.account_user}
                        onChange={(e) =>
                          updateForm("account_user", e.target.value)
                        }
                      />
                    ) : (
                      <span className="block truncate text-ui-fg-subtle">
                        {item.affiliate.account_user || "-"}
                      </span>
                    )}
                  </Table.Cell>
                  <Table.Cell className="min-w-[160px]">
                    {isEditing ? (
                      <input
                        className="w-full rounded border border-ui-border-base px-2 py-1 text-small-regular"
                        placeholder="@creator (TikTok MCN only)"
                        value={form.creator_username}
                        onChange={(e) =>
                          updateForm("creator_username", e.target.value)
                        }
                      />
                    ) : (
                      <span className="block truncate text-ui-fg-subtle">
                        {item.affiliate.creator_username || "-"}
                      </span>
                    )}
                  </Table.Cell>
                  <Table.Cell className="min-w-[300px] max-w-[420px]">
                    {isEditing ? (
                      <input
                        className="w-full rounded border border-ui-border-base px-2 py-1 text-small-regular"
                        placeholder="https://..."
                        value={form.url}
                        onChange={(e) => updateForm("url", e.target.value)}
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
                              product: productForm,
                              affiliate: form,
                            })
                          }
                        >
                          Save
                        </Button>
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => {
                            setEditingProduct(null);
                            setForm(emptyAffiliateForm);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => openEdit(item)}
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
        {(!data?.items || data.items.length === 0) && (
          <div className="py-8 text-center text-ui-fg-subtle">
            No products found
          </div>
        )}
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Affiliate Products",
});

export default AffiliateProductManager;
