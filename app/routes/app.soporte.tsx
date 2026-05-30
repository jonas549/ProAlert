import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import i18n from "../i18n";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function Soporte() {
  const t = i18n.soporte;
  return (
    <s-page heading={t.titulo}>
      <s-section heading={t.atencionTitulo}>
        <p style={{ margin: "0 0 8px" }}>{t.descripcion}</p>
        <p style={{ margin: 0 }}>{t.atencionTexto}</p>
      </s-section>
      <s-section slot="aside" heading={t.contactoTitulo}>
        <div style={{ marginBottom: 12 }}>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: "#6d7175" }}>{t.emailLabel}</p>
          <a href={`mailto:${t.email}`} style={{ color: "#008060", fontSize: 14 }}>{t.email}</a>
        </div>
        <s-button href={`mailto:${t.email}`}>{t.enviarCorreo}</s-button>
      </s-section>
      <s-section slot="aside" heading={t.tiempoTitulo}>
        <p style={{ margin: 0 }}>{t.tiempoTexto}</p>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
