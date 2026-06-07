import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

const ensureViewsTable = async (pg: any) => {
  await pg.query(`
    CREATE TABLE IF NOT EXISTS affiliate_product_views (
      id BIGSERIAL PRIMARY KEY,
      product_id TEXT NOT NULL,
      product_title TEXT NOT NULL DEFAULT '',
      view_id TEXT NOT NULL DEFAULT '',
      device_type TEXT NOT NULL DEFAULT '',
      country_code TEXT NOT NULL DEFAULT '',
      user_agent TEXT NOT NULL DEFAULT '',
      ip_address TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pg.query(`
    CREATE INDEX IF NOT EXISTS idx_affiliate_product_views_product
    ON affiliate_product_views (product_id)
  `);

  await pg.query(`
    CREATE INDEX IF NOT EXISTS idx_affiliate_product_views_created_at
    ON affiliate_product_views (created_at DESC)
  `);
};

const getRequestInfo = (req: MedusaRequest) => {
  const ua = req.headers["user-agent"] || "";
  const uaLower = String(ua).toLowerCase();
  let device_type = "desktop";

  if (/mobile|android|iphone|ipad|ipod/i.test(uaLower)) {
    device_type = "mobile";
  } else if (/tablet|ipad/i.test(uaLower)) {
    device_type = "tablet";
  }

  return {
    user_agent: String(ua),
    device_type,
    ip_address:
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "",
    country_code:
      (req.headers["x-vercel-ip-country"] as string) ||
      (req.headers["cf-ipcountry"] as string) ||
      "",
  };
};

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const pg = req.scope.resolve<any>(ContainerRegistrationKeys.PG_CONNECTION);
  await ensureViewsTable(pg);

  const rawProductIds = String(req.query.product_ids || "");
  const productIds = rawProductIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!productIds.length) {
    res.json({ views: {} });
    return;
  }

  const { rows } = await pg.query(
    `SELECT product_id, COUNT(*)::int AS count
     FROM affiliate_product_views
     WHERE product_id = ANY($1)
     GROUP BY product_id`,
    [productIds]
  );

  res.json({
    views: rows.reduce(
      (
        acc: Record<string, number>,
        row: { product_id: string; count: number }
      ) => ({
        ...acc,
        [row.product_id]: row.count,
      }),
      {}
    ),
  });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const pg = req.scope.resolve<any>(ContainerRegistrationKeys.PG_CONNECTION);
  await ensureViewsTable(pg);

  const { product_id, product_title, view_id } = req.body as {
    product_id?: string;
    product_title?: string;
    view_id?: string;
  };

  if (!product_id) {
    res.status(400).json({ message: "product_id is required" });
    return;
  }

  const requestInfo = getRequestInfo(req);
  const generatedViewId =
    view_id || `view_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;

  await pg.query(
    `INSERT INTO affiliate_product_views
      (
        product_id, product_title, view_id, device_type,
        country_code, user_agent, ip_address
      )
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      product_id,
      product_title || "",
      generatedViewId,
      requestInfo.device_type,
      requestInfo.country_code,
      requestInfo.user_agent,
      requestInfo.ip_address,
    ]
  );

  res.json({ success: true, view_id: generatedViewId });
}
