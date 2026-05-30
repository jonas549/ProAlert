import prisma from "./db";
import { DEFAULT_ADD_TO_CART_SELECTOR, DEFAULT_DESIGN } from "./types";

export async function getShopSettings(shop: string) {
  const settings = await prisma.shopSettings.findUnique({ where: { shop } });
  if (settings) return settings;

  return prisma.shopSettings.create({
    data: {
      shop,
      addToCartSelector: DEFAULT_ADD_TO_CART_SELECTOR,
      designDefaults: DEFAULT_DESIGN as object,
      showOnCollectionPages: true,
    },
  });
}

export async function upsertShopSettings(
  shop: string,
  data: {
    appEmbedEnabled?: boolean;
    addToCartSelector?: string;
    customCSS?: string;
    showOnCollectionPages?: boolean;
    designDefaults?: object;
    storefrontApiToken?: string;
  }
) {
  return prisma.shopSettings.upsert({
    where: { shop },
    create: {
      shop,
      addToCartSelector: DEFAULT_ADD_TO_CART_SELECTOR,
      designDefaults: DEFAULT_DESIGN as object,
      ...data,
    },
    update: data,
  });
}
