import { MedusaContainer } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";

const defaultCoupons = [
  {
    brand: "MERRELL",
    logo: "M",
    offer: "40% OFF",
    title: "Extra 40% Off Sale Items With Coupon Code",
    code: "EXTRA40",
    redemptions: "58,391",
    color: "#f58220",
  },
  {
    brand: "DICK'S",
    logo: "D",
    offer: "65% OFF",
    title: "Get up to 65% Off Running Shoes",
    code: "RUN65",
    redemptions: "24,784",
    color: "#006b5b",
  },
  {
    brand: "T-Mobile",
    logo: "T",
    offer: "$300 BACK",
    title: "1 Month on T-Mobile 5G Home Internet + Get up to $300 Back",
    code: "MONTHONUS",
    redemptions: "231,656",
    color: "#e20074",
  },
  {
    brand: "Tractor Supply",
    logo: "TS",
    offer: "$800 OFF",
    title: "Save up to $800 Off Select Mowers",
    code: "MOWER800",
    redemptions: "210",
    color: "#d71920",
  },
  {
    brand: "BBQGuys",
    logo: "BBQ",
    offer: "$500 OFF",
    title: "Save up to $500 on Delta Heat Grills & Items",
    code: "D500",
    redemptions: "300,160",
    color: "#f28c28",
  },
  {
    brand: "Paramount+",
    logo: "P+",
    offer: "$1/MONTH",
    title: "Paramount+ Premium No-Ads $1/Month For 2 Months",
    code: "M8C27L",
    redemptions: "1,994",
    color: "#0064ff",
  },
];

export default async function seedCoupons({
  container,
}: {
  container: MedusaContainer;
}) {
  const storeService = container.resolve(Modules.STORE);
  const [store] = await storeService.listStores();

  if (!store) {
    console.log("No store found, skipping coupon seed.");
    return;
  }

  await storeService.updateStores(store.id, {
    metadata: {
      ...store.metadata,
      coupons: defaultCoupons,
    },
  });

  console.log("Default coupons seeded successfully.");
}
