import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { IStoreModuleService } from "@medusajs/framework/types";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const storeService = req.scope.resolve<IStoreModuleService>("store");
  const [store] = await storeService.listStores();

  const coupons = (store.metadata?.coupons as Record<string, unknown>[]) || [];

  res.json({ coupons });
}
