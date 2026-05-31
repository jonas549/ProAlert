import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  Divider,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import i18n from "../i18n";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function Soporte() {
  const t = i18n.soporte;

  return (
    <Page title={t.titulo}>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                {t.atencionTitulo}
              </Text>
              <Divider />
              <Text as="p" variant="bodyMd">
                {t.descripcion}
              </Text>
              <Text as="p" variant="bodyMd">
                {t.atencionTexto}
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="300">
                <Text variant="headingMd" as="h2">
                  {t.contactoTitulo}
                </Text>
                <Divider />
                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" tone="subdued">
                    {t.emailLabel}
                  </Text>
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    {t.email}
                  </Text>
                </BlockStack>
                <Button url={`mailto:${t.email}`}>{t.enviarCorreo}</Button>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text variant="headingMd" as="h2">
                  {t.tiempoTitulo}
                </Text>
                <Divider />
                <Text as="p" variant="bodyLg" fontWeight="bold" tone="success">
                  {t.tiempoTexto}
                </Text>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export const headers: HeadersFunction = (headersArgs) =>
  boundary.headers(headersArgs);
