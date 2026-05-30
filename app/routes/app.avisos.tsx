import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import i18n from "../i18n";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function Avisos() {
  return (
    <s-page heading={i18n.avisos.titulo}>
      <s-section>
        <s-paragraph>{i18n.avisos.descripcion}</s-paragraph>
        <s-paragraph>{i18n.avisos.sinAvisos}</s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
