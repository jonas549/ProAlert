import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import {
  Page,
  Layout,
  Card,
  Banner,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Divider,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getShopSettings } from "../lib/shop-settings.server";
import { countWarnings, getWarnings } from "../lib/warnings.server";
import { getThemeEditorEmbedUrl } from "../lib/theme-editor";
import i18n from "../i18n";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;

  const [settings, total, warnings] = await Promise.all([
    getShopSettings(shop),
    countWarnings(shop),
    getWarnings(shop),
  ]);

  const activos = warnings.filter((w) => w.isActive).length;

  let shopName = shop;
  try {
    const res = await admin.graphql(`query { shop { name } }`);
    const data = await res.json();
    shopName = data?.data?.shop?.name ?? shop;
  } catch {}

  const themeEditorUrl = getThemeEditorEmbedUrl(
    shop,
    // eslint-disable-next-line no-undef
    process.env.SHOPIFY_API_KEY || ""
  );

  return {
    shopName,
    embedEnabled: settings.appEmbedEnabled,
    themeEditorUrl,
    kpis: { total, activos, inactivos: total - activos },
  };
};

export default function Dashboard() {
  const { shopName, embedEnabled, themeEditorUrl, kpis } =
    useLoaderData<typeof loader>();
  const t = i18n.dashboard;

  return (
    <Page
      title={t.titulo}
      primaryAction={
        <Button url="/app/warnings/new" variant="primary">
          {t.crearWarning}
        </Button>
      }
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {!embedEnabled && (
              <Banner
                title={t.embedNoActivado}
                tone="warning"
                action={{ content: t.activarEmbed, url: themeEditorUrl, target: "_blank" }}
              >
                <p>
                  El App Embed no esta activado. Los Warnings no se mostraran en tu
                  tienda hasta que lo actives en el editor del tema.
                </p>
              </Banner>
            )}
            {embedEnabled && (
              <Banner title={t.embedActivado} tone="success" />
            )}
            <Card>
              <BlockStack gap="200">
                <Text variant="headingMd" as="h2">
                  {t.bienvenida}, {shopName}
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Gestiona tus Warnings, revisa el estado del App Embed y accede
                  rapidamente a las acciones principales.
                </Text>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                KPIs
              </Text>
              <Divider />
              {[
                { label: t.totalWarnings, value: kpis.total },
                { label: t.activos, value: kpis.activos },
                { label: t.inactivos, value: kpis.inactivos },
              ].map(({ label, value }) => (
                <InlineStack key={label} align="space-between">
                  <Text as="span" variant="bodyMd" tone="subdued">
                    {label}
                  </Text>
                  <Text as="span" variant="headingLg" fontWeight="bold">
                    {value}
                  </Text>
                </InlineStack>
              ))}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export const headers: HeadersFunction = (headersArgs) =>
  boundary.headers(headersArgs);
