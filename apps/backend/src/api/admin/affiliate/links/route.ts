import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import { IProductModuleService } from "@medusajs/framework/types";

const AFFILIATE_SOURCES = [
  "aliexpress",
  "shopee",
  "amazon",
  "tiktok_shop",
  "lazada",
  "shein",
  "trip",
];

const PLATFORM_LABELS: Record<string, string> = {
  aliexpress: "AliExpress",
  shopee: "Shopee",
  amazon: "Amazon",
  tiktok_shop: "TikTok Shop",
  lazada: "Lazada",
  shein: "SHEIN",
  trip: "Trip.com",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const buildAffiliateMetadata = (
  affiliate?: {
    platform?: string;
    platform_title?: string;
    country?: string;
    affiliate_id?: string;
    account_user?: string;
    creator_username?: string;
    url?: string;
  },
  product?: ProductInput
) => {
  const platform = affiliate?.platform || "";
  const platformTitle =
    affiliate?.platform_title || PLATFORM_LABELS[platform] || "";

  const priceText =
    product?.original_price_text ||
    (product?.price
      ? `${String(product.currency_code || "usd").toUpperCase()} ${
          product.price
        }`
      : "");

  return {
    affiliate_platform: platform,
    affiliate_platform_title: platformTitle,
    affiliate_country: affiliate?.country || "",
    affiliate_id: affiliate?.affiliate_id || "",
    affiliate_account_user: affiliate?.account_user || "",
    affiliate_creator_username: affiliate?.creator_username || "",
    affiliate_url: affiliate?.url || "",
    affiliate_price_text: priceText,
    affiliate_price: product?.price ? String(product.price) : "",
    affiliate_currency_code: product?.currency_code || "",
    affiliate_external_product_id: product?.external_product_id || "",
    affiliate_shop_name: product?.shop_name || "",
    affiliate_seller_id: product?.seller_id || "",
    affiliate_commission_rate: product?.commission_rate || "",
    affiliate_earn_amount: product?.earn_amount || "",
    affiliate_sales: product?.sales || "",
    affiliate_rating: product?.product_rating || "",
    affiliate_product_type: "guide",
  };
};

type AffiliateInput = {
  platform?: string;
  platform_title?: string;
  country?: string;
  affiliate_id?: string;
  account_user?: string;
  creator_username?: string;
  url?: string;
};

type ProductInput = {
  title?: string;
  description?: string;
  thumbnail?: string;
  price?: number | string;
  currency_code?: string;
  sku?: string;
  handle?: string;
  category_id?: string;
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

const isAffiliateCategory = (category: any) => {
  const metadata = category.metadata || {};

  return (
    metadata.affiliate_category === true ||
    metadata.affiliate_category === "true" ||
    metadata.category_type === "affiliate" ||
    metadata.category_module === "affiliate"
  );
};

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const productService = req.scope.resolve<IProductModuleService>(
    Modules.PRODUCT
  );
  const [products, categories] = await Promise.all([
    productService.listProducts(
      {},
      {
        take: 200,
        select: [
          "id",
          "title",
          "handle",
          "thumbnail",
          "metadata",
          "categories.id",
        ],
        relations: ["categories"],
      }
    ),
    productService.listProductCategories(
      {},
      {
        take: 500,
        select: [
          "id",
          "name",
          "handle",
          "rank",
          "metadata",
          "parent_category_id",
        ],
      }
    ),
  ]);

  const affiliateCategories = categories
    .filter(isAffiliateCategory)
    .sort((a: any, b: any) => {
      const aOrder = Number(a.metadata?.affiliate_sort_order ?? a.rank ?? 0);
      const bOrder = Number(b.metadata?.affiliate_sort_order ?? b.rank ?? 0);

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      return String(a.name).localeCompare(String(b.name));
    });

  const items = products.map((p: any) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    thumbnail: p.thumbnail,
    category_id: p.categories?.[0]?.id || "",
    affiliate: {
      platform: p.metadata?.affiliate_platform || "",
      platform_title:
        p.metadata?.affiliate_platform_title ||
        PLATFORM_LABELS[p.metadata?.affiliate_platform as string] ||
        "",
      country: p.metadata?.affiliate_country || "",
      affiliate_id: p.metadata?.affiliate_id || "",
      account_user:
        p.metadata?.affiliate_account_user ||
        p.metadata?.affiliate_account ||
        "",
      creator_username: p.metadata?.affiliate_creator_username || "",
      url: p.metadata?.affiliate_url || "",
    },
    links: AFFILIATE_SOURCES.reduce(
      (acc, src) => ({
        ...acc,
        [src]: p.metadata?.[`affiliate_${src}`] || "",
      }),
      {} as Record<string, string>
    ),
  }));

  res.json({
    items,
    sources: AFFILIATE_SOURCES,
    platforms: AFFILIATE_SOURCES.map((value) => ({
      value,
      label: PLATFORM_LABELS[value] || value,
    })),
    categories: affiliateCategories.map((category: any) => ({
      id: category.id,
      name: category.metadata?.affiliate_nav_label || category.name,
      handle: category.handle,
      parent_category_id: category.parent_category_id || "",
    })),
  });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const productService = req.scope.resolve<IProductModuleService>(
      Modules.PRODUCT
    );
    const {
      id,
      affiliate,
      links,
      product: productInput,
      products: productInputs,
    } = req.body as {
      id?: string;
      affiliate?: AffiliateInput;
      product?: ProductInput;
      products?: { product: ProductInput; affiliate: AffiliateInput }[];
      links?: Record<string, string>;
    };

    const createGuideProducts = async (
      inputs: { product: ProductInput; affiliate: AffiliateInput }[]
    ) => {
      const query = req.scope.resolve<any>(ContainerRegistrationKeys.QUERY);
      const link = req.scope.resolve<any>(ContainerRegistrationKeys.LINK);

      const { data: salesChannels } = await query.graph({
        entity: "sales_channel",
        fields: ["id"],
      });

      const salesChannel = salesChannels[0];
      const categories = await productService.listProductCategories(
        {},
        {
          take: 500,
          select: ["id", "name", "handle", "metadata"],
        }
      );
      const affiliateCategories = categories.filter(isAffiliateCategory);

      if (!salesChannel?.id) {
        res.status(400).json({
          message:
            "Default sales channel is missing. Please initialize the store first.",
        });
        return;
      }

      const createdProducts = await productService.createProducts(
        inputs.map(({ product, affiliate }, index) => {
          const handleBase = slugify(product.handle || product.title || "");
          const handle = `${
            handleBase || "affiliate-product"
          }-${Date.now()}-${index}`;
          const categoryId =
            product.category_id ||
            affiliateCategories.find(
              (category: any) =>
                category.handle === product.category_handle ||
                category.name?.toLowerCase() === product.category?.toLowerCase()
            )?.id;

          return {
            title: product.title!,
            handle,
            description: product.description || "",
            thumbnail: product.thumbnail || null,
            status: ProductStatus.PUBLISHED,
            images: product.thumbnail ? [{ url: product.thumbnail }] : [],
            category_ids: categoryId ? [categoryId] : [],
            metadata: buildAffiliateMetadata(affiliate, product),
            options: [
              {
                title: "Offer",
                values: ["Affiliate"],
              },
            ],
            variants: [
              {
                title: "Affiliate offer",
                sku: product.sku || `AFF-${Date.now()}-${index}`,
                manage_inventory: false,
                allow_backorder: true,
                options: {
                  Offer: "Affiliate",
                },
              },
            ],
          };
        })
      );

      await Promise.all(
        createdProducts.map((product) =>
          link.create({
            [Modules.PRODUCT]: {
              product_id: product.id,
            },
            [Modules.SALES_CHANNEL]: {
              sales_channel_id: salesChannel.id,
            },
          })
        )
      );

      return createdProducts;
    };

    if (!id && Array.isArray(productInputs)) {
      const validInputs = productInputs.filter((item) => item.product?.title);

      if (!validInputs.length) {
        res.status(400).json({ message: "No valid products to import" });
        return;
      }

      const result = await createGuideProducts(validInputs);
      res.json({ success: true, count: result?.length || 0, products: result });
      return;
    }

    if (!id && productInput?.title) {
      const result = await createGuideProducts([
        { product: productInput, affiliate: affiliate || {} },
      ]);
      res.json({ success: true, product: result?.[0] });
      return;
    }

    if (!id) {
      res.status(400).json({ message: "id or product.title is required" });
      return;
    }

    const existingProduct = await productService.retrieveProduct(id, {
      select: ["id", "metadata"],
    });

    const metadata: Record<string, unknown> = {
      ...(existingProduct.metadata || {}),
    };

    if (affiliate) {
      const nextFields = buildAffiliateMetadata(affiliate);

      for (const [key, value] of Object.entries(nextFields)) {
        if (value) {
          metadata[key] = value;
        } else {
          delete metadata[key];
        }
      }
    }

    if (links) {
      for (const src of AFFILIATE_SOURCES) {
        if (links[src] !== undefined) {
          if (links[src]) {
            metadata[`affiliate_${src}`] = links[src];
          } else {
            delete metadata[`affiliate_${src}`];
          }
        }
      }
    }

    const updateData: Record<string, unknown> = { metadata };

    if (productInput?.category_id !== undefined) {
      updateData.category_ids = productInput.category_id
        ? [productInput.category_id]
        : [];
    }

    await productService.updateProducts(id, updateData);

    res.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save affiliate data";

    res.status(message === "Unauthorized" ? 401 : 400).json({
      message:
        message === "Unauthorized"
          ? "Affiliate product save was rejected as unauthorized. Please refresh the admin page and sign in again."
          : message,
    });
  }
}
