import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider as AppBridgeProvider } from "@shopify/shopify-app-react-router/react";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import esTranslations from "@shopify/polaris/locales/es.json";
import { authenticate } from "../shopify.server";
import i18n from "../i18n";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  // eslint-disable-next-line no-undef
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <PolarisProvider i18n={esTranslations}>
      <AppBridgeProvider embedded apiKey={apiKey}>
        <s-app-nav>
          <s-link href="/app">{i18n.nav.dashboard}</s-link>
          <s-link href="/app/warnings">{i18n.nav.warnings}</s-link>
          <s-link href="/app/settings">{i18n.nav.settings}</s-link>
          <s-link href="/app/soporte">{i18n.nav.soporte}</s-link>
        </s-app-nav>
        <Outlet />
      </AppBridgeProvider>
    </PolarisProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
