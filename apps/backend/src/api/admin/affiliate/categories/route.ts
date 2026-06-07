import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { IProductModuleService } from "@medusajs/framework/types";

const AFFILIATE_NAV_SECTIONS = [
  { value: "categories", label: "Categories" },
  { value: "coupons", label: "Coupons" },
  { value: "stores", label: "Stores" },
  { value: "travel", label: "Travel" },
  { value: "digital_services", label: "Digital Services" },
  { value: "gaming", label: "Gaming" },
  { value: "personal_finance", label: "Personal Finance" },
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const isAffiliateCategory = (category: any) => {
  const metadata = category.metadata || {};

  return (
    metadata.affiliate_category === true ||
    metadata.affiliate_category === "true" ||
    metadata.category_type === "affiliate" ||
    metadata.category_module === "affiliate"
  );
};

const toAffiliateCategory = (category: any) => {
  const metadata = (category.metadata || {}) as Record<string, unknown>;

  return {
    id: category.id,
    name: category.name,
    handle: category.handle,
    description: category.description || "",
    rank: category.rank || 0,
    is_active: Boolean(category.is_active),
    is_internal: Boolean(category.is_internal),
    parent_category_id: category.parent_category_id || "",
    metadata,
    affiliate: {
      enabled:
        metadata.affiliate_category === true ||
        metadata.affiliate_category === "true" ||
        metadata.category_type === "affiliate" ||
        metadata.category_module === "affiliate",
      nav_section: String(metadata.affiliate_nav_section || "categories"),
      nav_label: String(metadata.affiliate_nav_label || category.name || ""),
      sort_order: String(metadata.affiliate_sort_order || category.rank || 0),
      featured: metadata.affiliate_featured === true,
    },
  };
};

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const productService = req.scope.resolve<IProductModuleService>(
    Modules.PRODUCT
  );

  const categories = await productService.listProductCategories(
    {},
    {
      take: 500,
      select: [
        "id",
        "name",
        "handle",
        "description",
        "rank",
        "is_active",
        "is_internal",
        "parent_category_id",
        "metadata",
      ],
      order: {
        rank: "ASC",
        name: "ASC",
      },
    }
  );

  res.json({
    items: categories.filter(isAffiliateCategory).map(toAffiliateCategory),
    sections: AFFILIATE_NAV_SECTIONS,
  });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const productService = req.scope.resolve<IProductModuleService>(
      Modules.PRODUCT
    );

    const {
      id,
      category: categoryInput,
      affiliate,
    } = req.body as {
      id?: string;
      category?: {
        name?: string;
        handle?: string;
        description?: string;
        parent_category_id?: string;
      };
      affiliate?: {
        enabled?: boolean;
        nav_section?: string;
        nav_label?: string;
        sort_order?: string | number;
        featured?: boolean;
      };
    };

    if (!id && categoryInput?.name) {
      const created = await productService.createProductCategories({
        name: categoryInput.name,
        handle: categoryInput.handle || slugify(categoryInput.name),
        description: categoryInput.description || "",
        parent_category_id: categoryInput.parent_category_id || null,
        is_active: true,
        is_internal: false,
        metadata: {
          affiliate_category: true,
          category_type: "affiliate",
          category_module: "affiliate",
          affiliate_nav_section: affiliate?.nav_section || "categories",
          affiliate_nav_label: affiliate?.nav_label || categoryInput.name,
          affiliate_sort_order: String(affiliate?.sort_order || 0),
          affiliate_featured: Boolean(affiliate?.featured),
        },
      });

      res.json({ success: true, category: toAffiliateCategory(created) });
      return;
    }

    if (!id) {
      res.status(400).json({ message: "Category id or name is required" });
      return;
    }

    const category = await productService.retrieveProductCategory(id, {
      select: ["id", "name", "metadata", "parent_category_id"],
    });
    const metadata = {
      ...(category.metadata || {}),
    } as Record<string, unknown>;

    if (affiliate?.enabled) {
      metadata.affiliate_category = true;
      metadata.category_type = "affiliate";
      metadata.category_module = "affiliate";
      metadata.affiliate_nav_section = affiliate.nav_section || "categories";
      metadata.affiliate_nav_label = affiliate.nav_label || category.name;
      metadata.affiliate_sort_order = String(affiliate.sort_order || 0);
      metadata.affiliate_featured = Boolean(affiliate.featured);
    } else {
      delete metadata.affiliate_category;
      delete metadata.category_type;
      delete metadata.category_module;
      delete metadata.affiliate_nav_section;
      delete metadata.affiliate_nav_label;
      delete metadata.affiliate_sort_order;
      delete metadata.affiliate_featured;
    }

    const updateData: Record<string, unknown> = { metadata };

    if (categoryInput) {
      if (categoryInput.name !== undefined) {
        updateData.name = categoryInput.name;
      }
      if (categoryInput.handle !== undefined) {
        updateData.handle = categoryInput.handle;
      }
      if (categoryInput.description !== undefined) {
        updateData.description = categoryInput.description;
      }
      if (categoryInput.parent_category_id !== undefined) {
        updateData.parent_category_id =
          categoryInput.parent_category_id || null;
      }
    }

    const updated = await productService.updateProductCategories(
      id,
      updateData
    );

    res.json({ success: true, category: toAffiliateCategory(updated) });
  } catch (error) {
    res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to save affiliate category",
    });
  }
}
