import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

// GDPR: el cliente solicita sus datos. No almacenamos PII de clientes finales.
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`[webhook] ${topic} recibido para ${shop}`);

  return new Response();
};
