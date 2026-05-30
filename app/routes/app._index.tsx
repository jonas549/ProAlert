import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getShopSettings } from "../lib/shop-settings.server";
import { countWarnings, getWarnings } from "../lib/warnings.server";
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
  const inactivos = total - activos;

  let shopName = shop;
  try {
    const res = await admin.graphql(`query { shop { name } }`);
    const data = await res.json();
    shopName = data?.data?.shop?.name ?? shop;
  } catch {}

  const themeEditorUrl = `https://${shop}/admin/themes/current/editor?context=apps`;
  return { shopName, embedEnabled: settings.appEmbedEnabled, themeEditorUrl, kpis: { total, activos, inactivos } };
};

export default function Dashboard() {
  const { shopName, embedEnabled, themeEditorUrl, kpis } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const t = i18n.dashboard;

  return (
    <s-page heading={`${t.bienvenida}, ${shopName}`}>
      {!embedEnabled && (
        <s-banner tone="warning">
          <p slot="title">{t.embedNoActivado}</p>
          <s-button href={themeEditorUrl} target="_blank" variant="primary">
            {t.activarEmbed}
          </s-button>
        </s-banner>
      )}

      <s-section heading="KPIs">
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { label: t.totalWarnings, value: kpis.total },
            { label: t.activos, value: kpis.activos },
            { label: t.inactivos, value: kpis.inactivos },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                flex: "1 1 120px",
                border: "1px solid #e1e3e5",
                borderRadius: 8,
                padding: "16px 20px",
                background: "#f9fafb",
              }}
            >
              <p style={{ margin: "0 0 4px", fontSize: 12, color: "#6d7175" }}>{label}</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#202223" }}>{value}</p>
            </div>
          ))}
        </div>
      </s-section>

      <s-section>
        <s-button variant="primary" onClick={() => navigate("/app/warnings/new")}>
          {t.crearWarning}
        </s-button>
      </s-section>

      {embedEnabled && (
        <s-section slot="aside" heading={t.embedActivado}>
          <s-badge tone="success">{t.embedActivado}</s-badge>
        </s-section>
      )}
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
