import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import i18n from "../i18n";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function Inicio() {
  return (
    <s-page heading={i18n.inicio.titulo}>
      <s-section heading={i18n.inicio.bienvenida}>
        <s-paragraph>{i18n.inicio.sinDatos}</s-paragraph>
      </s-section>

      <s-section slot="aside" heading="KPIs">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            <s-text>{i18n.inicio.totalAvisos}:</s-text> —
          </s-paragraph>
          <s-paragraph>
            <s-text>{i18n.inicio.avisosActivos}:</s-text> —
          </s-paragraph>
          <s-paragraph>
            <s-text>{i18n.inicio.vistasHoy}:</s-text> —
          </s-paragraph>
          <s-paragraph>
            <s-text>{i18n.inicio.confirmaciones}:</s-text> —
          </s-paragraph>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
