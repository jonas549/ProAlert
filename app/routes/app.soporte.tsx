import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import i18n from "../i18n";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function Soporte() {
  return (
    <s-page heading={i18n.soporte.titulo}>
      <s-section>
        <s-paragraph>{i18n.soporte.mensajeCuerpo}</s-paragraph>
        <s-paragraph>
          <s-link href={`mailto:${i18n.soporte.email}`}>
            {i18n.soporte.email}
          </s-link>
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
