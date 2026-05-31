import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Badge,
  List,
  Divider,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getCurrentPlan } from "../lib/billing.server";
import i18n from "../i18n";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const plan = await getCurrentPlan(session.shop, admin);
  return { plan, shop: session.shop };
};

export default function Billing() {
  const { plan, shop } = useLoaderData<typeof loader>();
  const t = i18n.billing;

  const plans = [
    {
      key: "FREE",
      name: t.planFree,
      price: t.precioFree,
      features: [...t.features.free],
      highlight: false,
    },
    {
      key: "UNLIMITED",
      name: t.planUnlimited,
      price: t.precioUnlimited,
      features: [...t.features.unlimited],
      highlight: true,
    },
  ];

  return (
    <Page title={t.titulo}>
      <Layout>
        {plans.map((p) => (
          <Layout.Section key={p.key}>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text
                    variant="headingLg"
                    as="h2"
                    fontWeight="bold"
                  >
                    {p.name}
                  </Text>
                  {plan === p.key && (
                    <Badge tone="success">{t.planActivo}</Badge>
                  )}
                </InlineStack>

                <Text
                  variant="heading2xl"
                  as="p"
                  fontWeight="bold"
                >
                  {p.price}
                </Text>
                {p.key === "UNLIMITED" && (
                  <Text as="p" variant="bodySm" tone="subdued">
                    por mes, facturado mensualmente
                  </Text>
                )}

                <Divider />

                <List type="bullet">
                  {p.features.map((f) => (
                    <List.Item key={f}>{f}</List.Item>
                  ))}
                </List>

                {plan !== p.key && p.key === "UNLIMITED" && (
                  <Button
                    variant="primary"
                    url={`https://${shop}/admin/apps`}
                    target="_top"
                  >
                    {t.upgradeBtn}
                  </Button>
                )}
                {plan === p.key && (
                  <Button disabled>{t.planActivo}</Button>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        ))}
      </Layout>
    </Page>
  );
}

export const headers: HeadersFunction = (headersArgs) =>
  boundary.headers(headersArgs);
