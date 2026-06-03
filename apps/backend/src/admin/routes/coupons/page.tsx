"use client";

import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Button, Table, Badge } from "@medusajs/ui";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";

type Coupon = {
  brand: string;
  logo: string;
  offer: string;
  title: string;
  code: string;
  redemptions: string;
  color: string;
};

const empty: Coupon = {
  brand: "",
  logo: "",
  offer: "",
  title: "",
  code: "",
  redemptions: "0",
  color: "#bd4f83",
};

const CouponManager = () => {
  const [version, setVersion] = useState(0);

  const { data, isLoading } = useQuery<{ coupons: Coupon[] }>({
    queryKey: ["coupons", version],
    queryFn: () =>
      fetch("/admin/coupons", { credentials: "include" }).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch coupons");
        return r.json();
      }),
  });

  const saveMutation = useMutation({
    mutationFn: (coupons: Coupon[]) =>
      fetch("/admin/coupons", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupons }),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to save coupons");
        return r.json();
      }),
    onSuccess: () => {
      setVersion((v) => v + 1);
    },
    onError: (err) => {
      alert(
        "Save failed: " +
          (err instanceof Error ? err.message : "Unknown error"),
      );
    },
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<Coupon>(empty);
  const coupons = data?.coupons || [];

  const openAdd = () => {
    setEditingIndex(null);
    setForm(empty);
    setFormOpen(true);
  };

  const openEdit = (i: number) => {
    setEditingIndex(i);
    setForm({ ...coupons[i] });
    setFormOpen(true);
  };

  const save = () => {
    const next = [...coupons];
    if (editingIndex !== null) {
      next[editingIndex] = form;
    } else {
      next.push(form);
    }
    saveMutation.mutate(next);
    setEditingIndex(null);
    setForm(empty);
    setFormOpen(false);
  };

  const remove = (i: number) => {
    saveMutation.mutate(coupons.filter((_, idx) => idx !== i));
  };

  const closeForm = () => {
    setEditingIndex(null);
    setForm(empty);
    setFormOpen(false);
  };

  if (isLoading) {
    return (
      <Container className="p-8 text-center text-ui-fg-subtle">
        Loading coupons...
      </Container>
    );
  }

  return (
    <Container className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <Heading>Coupons & Discounts</Heading>
        <Button onClick={openAdd} variant="secondary">
          Add Coupon
        </Button>
      </div>

      {formOpen && (
        <div className="mb-6 space-y-4 rounded-lg border p-4">
          <Heading level="h2" className="text-ui-fg-base">
            {editingIndex !== null ? "Edit Coupon" : "New Coupon"}
          </Heading>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                Brand
              </label>
              <input
                className="w-full rounded-lg border border-ui-border-base px-3 py-2 text-small-regular"
                placeholder="e.g. NIKE"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                Logo
              </label>
              <input
                className="w-full rounded-lg border border-ui-border-base px-3 py-2 text-small-regular"
                placeholder="e.g. N"
                value={form.logo}
                onChange={(e) => setForm({ ...form, logo: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                Offer
              </label>
              <input
                className="w-full rounded-lg border border-ui-border-base px-3 py-2 text-small-regular"
                placeholder="e.g. 40% OFF"
                value={form.offer}
                onChange={(e) => setForm({ ...form, offer: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                Code
              </label>
              <input
                className="w-full rounded-lg border border-ui-border-base px-3 py-2 text-small-regular"
                placeholder="e.g. SAVE40"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                Title
              </label>
              <textarea
                className="w-full rounded-lg border border-ui-border-base px-3 py-2 text-small-regular"
                rows={2}
                placeholder="Coupon description"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                Redemptions
              </label>
              <input
                className="w-full rounded-lg border border-ui-border-base px-3 py-2 text-small-regular"
                placeholder="e.g. 58,391"
                value={form.redemptions}
                onChange={(e) =>
                  setForm({ ...form, redemptions: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-small-semi text-ui-fg-subtle">
                Color (hex)
              </label>
              <div className="flex items-center gap-2">
                <input
                  className="w-full rounded-lg border border-ui-border-base px-3 py-2 text-small-regular"
                  placeholder="#f58220"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                />
                <div
                  className="h-9 w-9 shrink-0 rounded border"
                  style={{ backgroundColor: form.color }}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={save}>
              {editingIndex !== null ? "Update" : "Add"} Coupon
            </Button>
            <Button variant="secondary" onClick={closeForm}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {coupons.length === 0 ? (
        <div className="py-12 text-center text-ui-fg-subtle">
          No coupons yet. Click &ldquo;Add Coupon&rdquo; to create one.
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Brand</Table.HeaderCell>
              <Table.HeaderCell>Offer</Table.HeaderCell>
              <Table.HeaderCell>Code</Table.HeaderCell>
              <Table.HeaderCell>Redemptions</Table.HeaderCell>
              <Table.HeaderCell className="text-right">
                Actions
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {coupons.map((c, i) => (
              <Table.Row key={i}>
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-8 w-10 items-center justify-center rounded text-small-semi text-white"
                      style={{ backgroundColor: c.color }}
                    >
                      {c.logo}
                    </div>
                    <span className="font-medium">{c.brand}</span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Badge color="orange">{c.offer}</Badge>
                </Table.Cell>
                <Table.Cell>
                  <code className="rounded bg-ui-bg-subtle px-1.5 py-0.5 text-small-semi">
                    {c.code}
                  </code>
                </Table.Cell>
                <Table.Cell className="text-ui-fg-subtle">
                  {c.redemptions}
                </Table.Cell>
                <Table.Cell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => openEdit(i)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => remove(i)}
                    >
                      Delete
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Coupons",
});

export default CouponManager;
