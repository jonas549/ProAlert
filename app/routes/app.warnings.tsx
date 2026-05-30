import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate, useFetcher } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getWarnings, deleteWarning, toggleWarning } from "../lib/warnings.server";
import { getShopSettings } from "../lib/shop-settings.server";
import i18n from "../i18n";
import type { Warning, WarningTarget } from "@prisma/client";
import { useState } from "react";

type WarningWithTargets = Warning & { targets: WarningTarget[] };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const [warnings, settings] = await Promise.all([
    getWarnings(session.shop),
    getShopSettings(session.shop),
  ]);
  const themeEditorUrl = `https://${session.shop}/admin/themes/current/editor?context=apps`;
  return { warnings, embedEnabled: settings.appEmbedEnabled, themeEditorUrl };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  const intent = form.get("intent") as string;
  if (intent === "delete") await deleteWarning(form.get("id") as string, session.shop);
  if (intent === "toggle") await toggleWarning(form.get("id") as string, session.shop, form.get("isActive") === "true");
  return null;
};

function targetingLabel(w: WarningWithTargets) {
  const t = w.targets[0];
  if (!t || t.targetType === "ALL") return i18n.warnings.targetingTodos;
  const n = t.targetIds.length;
  if (t.targetType === "PRODUCTS") return `${n} ${i18n.warnings.targetingProductos}`;
  if (t.targetType === "VARIANTS") return `${n} ${i18n.warnings.targetingVariantes}`;
  return `${n} ${i18n.warnings.targetingColecciones}`;
}

export default function WarningsList() {
  const { warnings, embedEnabled, themeEditorUrl } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [tab, setTab] = useState<"all" | "active" | "inactive">("all");
  const [search, setSearch] = useState("");

  const filtered = (warnings as WarningWithTargets[]).filter((w) => {
    if (tab === "active" && !w.isActive) return false;
    if (tab === "inactive" && w.isActive) return false;
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <s-page heading={i18n.warnings.titulo}>
      <s-button slot="primary-action" variant="primary" onClick={() => navigate("/app/warnings/new")}>
        {i18n.warnings.crearWarning}
      </s-button>

      {!embedEnabled && (
        <s-banner tone="warning">
          <p slot="title">{i18n.warnings.embedBannerInactivo}</p>
          <s-button href={themeEditorUrl} target="_blank">{i18n.warnings.activarEmbed}</s-button>
        </s-banner>
      )}

      <s-section>
        {/* Search */}
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder={i18n.comun.buscar}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "6px 10px", border: "1px solid #c9cccf", borderRadius: 6, fontSize: 14, boxSizing: "border-box" }}
          />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["all", "active", "inactive"] as const).map((key) => {
            const label = key === "all" ? i18n.warnings.tabTodos : key === "active" ? i18n.warnings.tabActivos : i18n.warnings.tabInactivos;
            return (
              <button key={key} onClick={() => setTab(key)} style={{ padding: "6px 16px", borderRadius: 6, border: "1px solid", borderColor: tab === key ? "#008060" : "#c9cccf", background: tab === key ? "#e6f4f0" : "#fff", color: tab === key ? "#008060" : "#6d7175", cursor: "pointer", fontWeight: tab === key ? 600 : 400 }}>
                {label}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <p style={{ color: "#6d7175" }}>{i18n.warnings.sinWarnings}</p>
            <div style={{ marginTop: 12 }}>
              <s-button variant="primary" onClick={() => navigate("/app/warnings/new")}>{i18n.warnings.crearWarning}</s-button>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr>
                  {[i18n.warnings.colNombre, i18n.warnings.colEstado, i18n.warnings.colTargeting, i18n.warnings.colTipo, i18n.warnings.colActivo, i18n.warnings.colAcciones].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", borderBottom: "2px solid #e1e3e5", color: "#6d7175", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((w) => {
                  const isInvalid = w.targets[0] && w.targets[0].targetType !== "ALL" && w.targets[0].targetIds.length === 0;
                  const tone = !w.isActive ? "info" : isInvalid ? "critical" : "success";
                  const label = !w.isActive ? i18n.warnings.estadoInactivo : isInvalid ? i18n.warnings.estadoInvalidTargeting : i18n.warnings.estadoActivo;
                  return (
                    <tr key={w.id} style={{ borderBottom: "1px solid #f6f6f7" }}>
                      <td style={{ padding: "12px" }}>
                        <strong style={{ fontSize: 14 }}>{w.name}</strong>
                        <div style={{ fontSize: 12, color: "#6d7175", marginTop: 2 }}>
                          {new Date(w.createdAt).toLocaleDateString("es")}
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <s-badge tone={tone as "success" | "info" | "critical"}>{label}</s-badge>
                      </td>
                      <td style={{ padding: "12px" }}>{targetingLabel(w)}</td>
                      <td style={{ padding: "12px" }}>{w.renderType === "POPUP" ? i18n.warnings.tipoPopup : i18n.warnings.tipoEmbebido}</td>
                      <td style={{ padding: "12px" }}>
                        <fetcher.Form method="post">
                          <input type="hidden" name="intent" value="toggle" />
                          <input type="hidden" name="id" value={w.id} />
                          <input type="hidden" name="isActive" value={String(!w.isActive)} />
                          <input type="checkbox" checked={w.isActive} onChange={(e) => { const f = e.target.closest("form") as HTMLFormElement; fetcher.submit(f); }} style={{ accentColor: "#008060", width: 16, height: 16, cursor: "pointer" }} />
                        </fetcher.Form>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <s-button variant="tertiary" onClick={() => navigate(`/app/warnings/${w.id}/edit`)}>{i18n.warnings.editar}</s-button>
                          <fetcher.Form method="post">
                            <input type="hidden" name="intent" value="delete" />
                            <input type="hidden" name="id" value={w.id} />
                            <s-button tone="critical" variant="tertiary" type="submit" onClick={(e: Event) => { if (!window.confirm(i18n.warnings.confirmarEliminar)) e.preventDefault(); }}>{i18n.warnings.eliminar}</s-button>
                          </fetcher.Form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
