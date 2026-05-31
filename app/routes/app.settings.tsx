import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import {
  Page,
  Layout,
  Card,
  Banner,
  BlockStack,
  Text,
  TextField,
  Checkbox,
  Button,
  Badge,
  PageActions,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getShopSettings, upsertShopSettings } from "../lib/shop-settings.server";
import { getThemeEditorEmbedUrl } from "../lib/theme-editor";
import DesignPanel from "../components/DesignPanel";
import type { DesignConfig } from "../lib/types";
import { DEFAULT_DESIGN, DEFAULT_ADD_TO_CART_SELECTOR } from "../lib/types";
import i18n from "../i18n";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const settings = await getShopSettings(session.shop);
  const themeEditorUrl = getThemeEditorEmbedUrl(
    session.shop,
    // eslint-disable-next-line no-undef
    process.env.SHOPIFY_API_KEY || ""
  );
  return { settings, themeEditorUrl };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const body = JSON.parse(formData.get("data") as string) as {
    addToCartSelector: string;
    customCSS: string;
    showOnCollectionPages: boolean;
    designDefaults: object;
  };
  await upsertShopSettings(session.shop, body);
  return { ok: true };
};

export default function Settings() {
  const { settings, themeEditorUrl } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const [selector, setSelector] = useState(
    settings.addToCartSelector || DEFAULT_ADD_TO_CART_SELECTOR
  );
  const [css, setCss] = useState(settings.customCSS ?? "");
  const [showOnCollections, setShowOnCollections] = useState(settings.showOnCollectionPages);
  const [design, setDesign] = useState<DesignConfig>(
    (settings.designDefaults as DesignConfig) ?? DEFAULT_DESIGN
  );
  const [isDirty, setIsDirty] = useState(false);

  const t = i18n.settings;
  const saved = fetcher.data?.ok;

  const markDirty = () => setIsDirty(true);

  const handleSave = () => {
    const fd = new FormData();
    fd.append(
      "data",
      JSON.stringify({
        addToCartSelector: selector,
        customCSS: css,
        showOnCollectionPages: showOnCollections,
        designDefaults: design,
      })
    );
    fetcher.submit(fd, { method: "POST" });
    setIsDirty(false);
  };

  return (
    <Page title={t.titulo}>
      {saved && (
        <div style={{ marginBottom: 16 }}>
          <Banner tone="success" onDismiss={() => {}}>
            <p>{t.guardadoOk}</p>
          </Banner>
        </div>
      )}

      <Layout>
        <Layout.AnnotatedSection
          title={t.embedSection}
          description="Activa el app embed en tu tema para que los Warnings se muestren en tu tienda."
        >
          <Card>
            <BlockStack gap="300">
              {settings.appEmbedEnabled ? (
                <Badge tone="success">{t.embedActivado}</Badge>
              ) : (
                <BlockStack gap="200">
                  <Badge tone="warning">{t.embedNoActivado}</Badge>
                  <div>
                    <Button url={themeEditorUrl} target="_blank">
                      {t.activarBtn}
                    </Button>
                  </div>
                </BlockStack>
              )}
            </BlockStack>
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          title={t.generalSection}
          description={t.selectorHint}
        >
          <Card>
            <TextField
              label={t.selectorLabel}
              value={selector}
              onChange={(v) => { setSelector(v); markDirty(); }}
              multiline={3}
              autoComplete="off"
              monospaced
            />
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          title={t.collectionsSection}
          description={t.showOnCollectionsHint}
        >
          <Card>
            <Checkbox
              label={t.showOnCollectionsLabel}
              checked={showOnCollections}
              onChange={(v) => { setShowOnCollections(v); markDirty(); }}
            />
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          title={t.designSection}
          description={t.designHint}
        >
          <Card>
            <DesignPanel
              design={design}
              onChange={(d) => { setDesign(d); markDirty(); }}
            />
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          title={t.cssSection}
          description="Solo edita si conoces CSS. Estos estilos se inyectan en el storefront."
        >
          <BlockStack gap="300">
            <Banner tone="warning">
              <p>{t.cssHint}</p>
            </Banner>
            <Card>
              <TextField
                label={t.cssLabel}
                labelHidden
                value={css}
                onChange={(v) => { setCss(v); markDirty(); }}
                multiline={6}
                autoComplete="off"
                monospaced
                placeholder="/* Solo edita si conoces CSS */"
              />
            </Card>
          </BlockStack>
        </Layout.AnnotatedSection>
      </Layout>

      <div style={{ marginTop: 16 }}>
        <PageActions
          primaryAction={{
            content: t.guardar,
            onAction: handleSave,
            loading: fetcher.state === "submitting",
            disabled: !isDirty,
          }}
        />
      </div>
    </Page>
  );
}

export const headers: HeadersFunction = (headersArgs) =>
  boundary.headers(headersArgs);
