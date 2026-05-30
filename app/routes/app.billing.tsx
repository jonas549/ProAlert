import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
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
    <s-page heading={t.titulo}>
      <s-section>
        <s-paragraph>
          {t.planActual}: <strong>{plan === "FREE" ? t.planFree : t.planUnlimited}</strong>
        </s-paragraph>
      </s-section>

      <s-section>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {plans.map((p) => (
            <div
              key={p.key}
              style={{
                flex: "1 1 260px",
                border: `2px solid ${p.highlight ? "#008060" : "#e1e3e5"}`,
                borderRadius: 12,
                padding: 24,
                background: p.highlight ? "#f0faf6" : "#fff",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <strong style={{ fontSize: 18 }}>{p.name}</strong>
                {plan === p.key && (
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      background: "#008060",
                      color: "#fff",
                      borderRadius: 12,
                      fontWeight: 600,
                    }}
                  >
                    {t.planActivo}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, color: p.highlight ? "#008060" : "#202223" }}>
                {p.price}
              </div>
              <ul style={{ padding: "0 0 0 16px", margin: "0 0 20px", fontSize: 14, color: "#6d7175", lineHeight: 1.8 }}>
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              {plan !== p.key && p.key === "UNLIMITED" && (
                <a
                  href={`https://${shop}/admin/apps`}
                  target="_top"
                  style={{
                    display: "inline-block",
                    padding: "8px 20px",
                    background: "#008060",
                    color: "#fff",
                    borderRadius: 6,
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {t.upgradeBtn}
                </a>
              )}
            </div>
          ))}
        </div>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
