import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function seedAffiliateDb({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const pg = container.resolve<any>(ContainerRegistrationKeys.PG_CONNECTION);

  logger.info("Creating affiliate_clicks table...");

  await pg.query(`
    CREATE TABLE IF NOT EXISTS affiliate_clicks (
      id BIGSERIAL PRIMARY KEY,
      product_id TEXT NOT NULL,
      product_title TEXT NOT NULL DEFAULT '',
      affiliate_url TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT '',
      device_type TEXT NOT NULL DEFAULT '',
      country_code TEXT NOT NULL DEFAULT '',
      user_agent TEXT NOT NULL DEFAULT '',
      ip_address TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pg.query(`
    CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at
    ON affiliate_clicks (created_at DESC)
  `);

  await pg.query(`
    CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_source
    ON affiliate_clicks (source)
  `);

  await pg.query(`
    CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_product
    ON affiliate_clicks (product_id)
  `);

  logger.info("affiliate_clicks table ready.");
}
