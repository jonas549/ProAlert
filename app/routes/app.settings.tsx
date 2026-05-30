import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getShopSettings, upsertShopSettings } from "../lib/shop-settings.server";
import DesignPanel from "../components/DesignPanel";
import type { DesignConfig } from "../lib/types";
import { DEFAULT_DESIGN, DEFAULT_ADD_TO_CART_SELECTOR } from "../lib/types";
import i18n from "../i18n";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const settings = await getShopSettings(session.shop);
  const themeEditorUrl = `https://${session.shop}/admin/themes/current/editor?context=apps`;
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
    storefrontApiToken: string;
  };
  await upsertShopSettings(session.shop, {
    addToCartSelector: body.addToCartSelector,
    customCSS: body.customCSS || undefined,
    showOnCollectionPages: body.showOnCollectionPages,
    designDefaults: body.designDefaults,
    storefrontApiToken: body.storefrontApiToken || undefined,
  });
  return { ok: true };
};

export default function Settings() {
  const { settings, themeEditorUrl } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const [selector, setSelector] = useState(settings.addToCartSelector || DEFAULT_ADD_TO_CART_SELECTOR);
  const [css, setCss] = useState(settings.customCSS ?? "");
  const [showOnCollections, setShowOnCollections] = useState(settings.showOnCollectionPages);
  const [design, setDesign] = useState<DesignConfig>((settings.designDefaults as DesignConfig) ?? DEFAULT_DESIGN);
  const [apiToken, setApiToken] = useState(settings.storefrontApiToken ?? "");

  const t = i18n.settings;
  const saved = fetcher.data?.ok;

  const handleSave = () => {
    const fd = new FormData();
    fd.append("data", JSON.stringify({ addToCartSelector: selector, customCSS: css, showOnCollectionPages: showOnCollections, designDefaults: design, storefrontApiToken: apiToken }));
    fetcher.submit(fd, { method: "POST" });
  };

  const inputStyle: React.CSSProperties = { display: "block", width: "100%", padding: "6px 10px", border: "1px solid #c9cccf", borderRadius: 6, fontSize: 14, boxSizing: "border-box" };
  const textareaStyle: React.CSSProperties = { ...inputStyle, fontFamily: "monospace", fontSize: 13 };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#202223", marginBottom: 4 };
  const hintStyle: React.CSSProperties = { fontSize: 12, color: "#6d7175", marginTop: 4 };

  return (
    <s-page heading={t.titulo}>
      <s-button slot="primary-action" variant="primary" onClick={handleSave} loading={fetcher.state === "submitting"}>{t.guardar}</s-button>

      {saved && <s-banner tone="success"><p>{t.guardadoOk}</p></s-banner>}

      <s-section heading={t.embedSection}>
        {settings.appEmbedEnabled ? (
          <s-badge tone="success">{t.embedActivado}</s-badge>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
            <s-badge tone="warning">{t.embedNoActivado}</s-badge>
            <s-button href={themeEditorUrl} target="_blank">{t.activarBtn}</s-button>
          </div>
        )}
      </s-section>

      <s-section heading={t.generalSection}>
        <label style={labelStyle}>{t.selectorLabel}</label>
        <textarea value={selector} onChange={(e) => setSelector(e.target.value)} rows={3} style={textareaStyle} />
        <p style={hintStyle}>{t.selectorHint}</p>
      </s-section>

      <s-section heading={t.collectionsSection}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
          <input type="checkbox" checked={showOnCollections} onChange={(e) => setShowOnCollections(e.target.checked)} style={{ accentColor: "#008060" }} />
          {t.showOnCollectionsLabel}
        </label>
        <p style={hintStyle}>{t.showOnCollectionsHint}</p>
      </s-section>

      <s-section heading={t.designSection}>
        <p style={hintStyle}>{t.designHint}</p>
        <div style={{ marginTop: 12 }}>
          <DesignPanel design={design} onChange={setDesign} />
        </div>
      </s-section>

      <s-section heading={t.cssSection}>
        <label style={labelStyle}>{t.cssLabel}</label>
        <textarea value={css} onChange={(e) => setCss(e.target.value)} rows={6} style={textareaStyle} placeholder="/* Solo edita si conoces CSS */" />
        <p style={{ ...hintStyle, color: "#D72C0D" }}>{t.cssHint}</p>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
