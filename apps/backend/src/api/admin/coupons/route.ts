import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { IStoreModuleService } from "@medusajs/framework/types";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const storeService = req.scope.resolve<IStoreModuleService>("store");
  const [store] = await storeService.listStores();

  const coupons = (store.metadata?.coupons as Record<string, unknown>[]) || [];

  res.json({ coupons });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const storeService = req.scope.resolve<IStoreModuleService>("store");
  const [store] = await storeService.listStores();

  const { coupons } = req.body as { coupons: Record<string, unknown>[] };

  if (!Array.isArray(coupons)) {
    res.status(400).json({ message: "coupons must be an array" });
    return;
  }

  const metadata = { ...store.metadata, coupons };

  await storeService.updateStores(store.id, { metadata });

  res.json({ success: true, coupons });
}
