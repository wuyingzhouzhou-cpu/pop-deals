import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { IProductModuleService } from "@medusajs/framework/types";

const AFFILIATE_SOURCES = [
  "lazada",
  "aliexpress",
  "tiktok",
  "shopee",
  "trip",
  "shein",
];

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const productService = req.scope.resolve<IProductModuleService>(
    Modules.PRODUCT,
  );
  const products = await productService.listProducts(
    {},
    { take: 200, select: ["id", "title", "handle", "thumbnail", "metadata"] },
  );

  const items = products.map((p: any) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    thumbnail: p.thumbnail,
    links: AFFILIATE_SOURCES.reduce(
      (acc, src) => ({
        ...acc,
        [src]: p.metadata?.[`affiliate_${src}`] || "",
      }),
      {} as Record<string, string>,
    ),
  }));

  res.json({ items, sources: AFFILIATE_SOURCES });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const productService = req.scope.resolve<IProductModuleService>(
    Modules.PRODUCT,
  );
  const { id, links } = req.body as {
    id: string;
    links: Record<string, string>;
  };

  if (!id || !links) {
    res.status(400).json({ message: "id and links are required" });
    return;
  }

  const product = await productService.retrieveProduct(id, {
    select: ["id", "metadata"],
  });

  const metadata: Record<string, unknown> = { ...(product.metadata || {}) };

  for (const src of AFFILIATE_SOURCES) {
    if (links[src] !== undefined) {
      if (links[src]) {
        metadata[`affiliate_${src}`] = links[src];
      } else {
        delete metadata[`affiliate_${src}`];
      }
    }
  }

  await productService.updateProducts(id, { metadata });

  res.json({ success: true });
}
