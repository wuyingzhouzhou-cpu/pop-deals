"use client";

import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Badge, Button, Container, Heading, Table } from "@medusajs/ui";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

type AffiliateCategory = {
  id: string;
  name: string;
  handle: string;
  description: string;
  rank: number;
  is_active: boolean;
  is_internal: boolean;
  parent_category_id: string;
  affiliate: {
    enabled: boolean;
    nav_section: string;
    nav_label: string;
    sort_order: string;
    featured: boolean;
  };
};

type CategoryForm = {
  name: string;
  handle: string;
  description: string;
  parent_category_id: string;
};

type CategoriesResponse = {
  items: AffiliateCategory[];
  sections: { value: string; label: string }[];
};

const AffiliateCategories = () => {
  const [version, setVersion] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>({
    name: "",
    handle: "",
    description: "",
    parent_category_id: "",
  });
  const [form, setForm] = useState<AffiliateCategory["affiliate"]>({
    enabled: true,
    nav_section: "categories",
    nav_label: "",
    sort_order: "0",
    featured: false,
  });

  const { data, isLoading } = useQuery<CategoriesResponse>({
    queryKey: ["affiliate-categories", version],
    queryFn: () =>
      fetch("/admin/affiliate/categories", { credentials: "include" }).then(
        async (r) => {
          const data = await r.json().catch(() => null);

          if (!r.ok) {
            throw new Error(data?.message || "Failed to load categories");
          }

          return data;
        }
      ),
  });

  const saveMutation = useMutation({
    mutationFn: (body: {
      id?: string;
      category?: CategoryForm;
      affiliate: AffiliateCategory["affiliate"];
    }) =>
      fetch("/admin/affiliate/categories", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(async (r) => {
        const data = await r.json().catch(() => null);

        if (!r.ok) {
          throw new Error(data?.message || "Failed to save category");
        }

        return data;
      }),
    onSuccess: () => {
      setVersion((v) => v + 1);
      setEditingId(null);
      setCreateOpen(false);
      setCategoryForm({
        name: "",
        handle: "",
        description: "",
        parent_category_id: "",
      });
    },
    onError: (err) => {
      alert(
        "Save failed: " + (err instanceof Error ? err.message : "Unknown error")
      );
    },
  });

  const sections = data?.sections || [];
  const items = data?.items || [];
  const parentCandidates = items.filter((item) => !item.parent_category_id);

  const openEdit = (item: AffiliateCategory) => {
    setEditingId(item.id);
    setCategoryForm({
      name: item.name,
      handle: item.handle,
      description: item.description || "",
      parent_category_id: item.parent_category_id || "",
    });
    setForm({
      enabled: item.affiliate.enabled,
      nav_section: item.affiliate.nav_section || "categories",
      nav_label: item.affiliate.nav_label || item.name,
      sort_order: String(item.affiliate.sort_order || item.rank || 0),
      featured: Boolean(item.affiliate.featured),
    });
  };

  const saveNewCategory = () => {
    if (!categoryForm.name.trim()) {
      alert("Category name is required");
      return;
    }

    saveMutation.mutate({
      category: categoryForm,
      affiliate: form,
    });
  };

  if (isLoading) {
    return (
      <Container className="p-8 text-center text-ui-fg-subtle">
        Loading affiliate categories...
      </Container>
    );
  }

  return (
    <Container className="p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Heading>Affiliate Categories</Heading>
          <p className="mt-2 max-w-4xl text-small-regular text-ui-fg-subtle">
            Manage the affiliate taxonomy shown on the storefront. Create parent
            categories and child categories here, then assign affiliate products
            to those categories.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setCreateOpen((open) => !open);
            setEditingId(null);
            setForm({
              enabled: true,
              nav_section: "categories",
              nav_label: "",
              sort_order: "0",
              featured: false,
            });
            setCategoryForm({
              name: "",
              handle: "",
              description: "",
              parent_category_id: "",
            });
          }}
        >
          {createOpen ? "Close" : "Add Affiliate Category"}
        </Button>
      </div>

      {createOpen && (
        <div className="mb-6 rounded-lg border border-ui-border-base bg-white p-5">
          <Heading level="h2" className="mb-4 text-ui-fg-base">
            New affiliate category
          </Heading>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                Name
              </label>
              <input
                className="w-full rounded border border-ui-border-base px-3 py-2 text-small-regular"
                value={categoryForm.name}
                onChange={(event) =>
                  setCategoryForm({
                    ...categoryForm,
                    name: event.target.value,
                    handle:
                      categoryForm.handle ||
                      event.target.value
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, ""),
                  })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                Handle
              </label>
              <input
                className="w-full rounded border border-ui-border-base px-3 py-2 text-small-regular"
                value={categoryForm.handle}
                onChange={(event) =>
                  setCategoryForm({
                    ...categoryForm,
                    handle: event.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                Parent category
              </label>
              <select
                className="w-full rounded border border-ui-border-base px-3 py-2 text-small-regular"
                value={categoryForm.parent_category_id}
                onChange={(event) =>
                  setCategoryForm({
                    ...categoryForm,
                    parent_category_id: event.target.value,
                  })
                }
              >
                <option value="">Top-level category</option>
                {parentCandidates.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.affiliate.nav_label || item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                Storefront channel
              </label>
              <select
                className="w-full rounded border border-ui-border-base px-3 py-2 text-small-regular"
                value={form.nav_section}
                onChange={(event) =>
                  setForm({ ...form, nav_section: event.target.value })
                }
              >
                {sections.map((section) => (
                  <option key={section.value} value={section.value}>
                    {section.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                Description
              </label>
              <textarea
                className="w-full rounded border border-ui-border-base px-3 py-2 text-small-regular"
                rows={3}
                value={categoryForm.description}
                onChange={(event) =>
                  setCategoryForm({
                    ...categoryForm,
                    description: event.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={saveNewCategory}>Create Category</Button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Category</Table.HeaderCell>
              <Table.HeaderCell>Handle</Table.HeaderCell>
              <Table.HeaderCell>Storefront</Table.HeaderCell>
              <Table.HeaderCell>Parent</Table.HeaderCell>
              <Table.HeaderCell>Nav section</Table.HeaderCell>
              <Table.HeaderCell>Sort</Table.HeaderCell>
              <Table.HeaderCell className="text-right">
                Actions
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items.map((item) => {
              const editing = editingId === item.id;
              const sectionLabel =
                sections.find((s) => s.value === item.affiliate.nav_section)
                  ?.label || item.affiliate.nav_section;
              const parent = items.find(
                (category) => category.id === item.parent_category_id
              );

              return (
                <Table.Row key={item.id}>
                  <Table.Cell>
                    <div className="font-medium">
                      {item.parent_category_id ? "↳ " : ""}
                      {item.name}
                    </div>
                    <div className="mt-1 flex gap-1">
                      {item.affiliate.enabled ? (
                        <Badge color="green">Affiliate</Badge>
                      ) : (
                        <Badge color="grey">Product</Badge>
                      )}
                      {item.is_internal && (
                        <Badge color="orange">Internal</Badge>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>{item.handle}</Table.Cell>
                  <Table.Cell>
                    {editing ? (
                      <label className="flex items-center gap-2 text-small-regular">
                        <input
                          type="checkbox"
                          checked={form.enabled}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              enabled: event.target.checked,
                            })
                          }
                        />
                        Show as affiliate category
                      </label>
                    ) : item.affiliate.enabled ? (
                      item.affiliate.nav_label || item.name
                    ) : (
                      "-"
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {editing ? (
                      <select
                        className="w-full rounded border border-ui-border-base px-2 py-1 text-small-regular"
                        value={categoryForm.parent_category_id}
                        onChange={(event) =>
                          setCategoryForm({
                            ...categoryForm,
                            parent_category_id: event.target.value,
                          })
                        }
                      >
                        <option value="">Top level</option>
                        {parentCandidates
                          .filter((candidate) => candidate.id !== item.id)
                          .map((candidate) => (
                            <option key={candidate.id} value={candidate.id}>
                              {candidate.affiliate.nav_label || candidate.name}
                            </option>
                          ))}
                      </select>
                    ) : parent ? (
                      parent.affiliate.nav_label || parent.name
                    ) : (
                      "Top level"
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {editing ? (
                      <select
                        className="w-full rounded border border-ui-border-base px-2 py-1 text-small-regular"
                        value={form.nav_section}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            nav_section: event.target.value,
                          })
                        }
                      >
                        {sections.map((section) => (
                          <option key={section.value} value={section.value}>
                            {section.label}
                          </option>
                        ))}
                      </select>
                    ) : item.affiliate.enabled ? (
                      sectionLabel
                    ) : (
                      "-"
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {editing ? (
                      <input
                        className="w-20 rounded border border-ui-border-base px-2 py-1 text-small-regular"
                        value={form.sort_order}
                        onChange={(event) =>
                          setForm({ ...form, sort_order: event.target.value })
                        }
                      />
                    ) : item.affiliate.enabled ? (
                      item.affiliate.sort_order || "0"
                    ) : (
                      "-"
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {editing ? (
                      <div className="flex justify-end gap-2">
                        <input
                          className="w-36 rounded border border-ui-border-base px-2 py-1 text-small-regular"
                          placeholder="Name"
                          value={categoryForm.name}
                          onChange={(event) =>
                            setCategoryForm({
                              ...categoryForm,
                              name: event.target.value,
                            })
                          }
                        />
                        <input
                          className="w-40 rounded border border-ui-border-base px-2 py-1 text-small-regular"
                          placeholder="Display label"
                          value={form.nav_label}
                          onChange={(event) =>
                            setForm({ ...form, nav_label: event.target.value })
                          }
                        />
                        <Button
                          size="small"
                          onClick={() =>
                            saveMutation.mutate({
                              id: item.id,
                              category: categoryForm,
                              affiliate: form,
                            })
                          }
                        >
                          Save
                        </Button>
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => openEdit(item)}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Affiliate Categories",
});

export default AffiliateCategories;
