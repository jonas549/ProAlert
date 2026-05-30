import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getActiveWarningsForStorefront } from "../lib/warnings.server";
import { getShopSettings } from "../lib/shop-settings.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.public.appProxy(request);

  const shop = session?.shop ?? new URL(request.url).searchParams.get("shop") ?? "";
  if (!shop) {
    return new Response(JSON.stringify({ warnings: [], settings: {} }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const [warnings, settings] = await Promise.all([
    getActiveWarningsForStorefront(shop),
    getShopSettings(shop),
  ]);

  return new Response(
    JSON.stringify({
      warnings,
      settings: {
        addToCartSelector: settings.addToCartSelector,
        showOnCollectionPages: settings.showOnCollectionPages,
        customCSS: settings.customCSS,
        designDefaults: settings.designDefaults,
      },
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store",
      },
    }
  );
};
