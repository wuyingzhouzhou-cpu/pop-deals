import { sdk } from "@lib/config"

export async function listCoupons() {
  return sdk.client
    .fetch<{ coupons: Record<string, unknown>[] }>("/store/coupons", {
      cache: "force-cache",
    })
    .then(({ coupons }) => coupons)
}
