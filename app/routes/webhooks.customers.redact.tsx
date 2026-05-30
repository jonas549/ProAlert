import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

// GDPR: solicitud de eliminación de datos de un cliente final.
// No almacenamos PII de clientes finales — respondemos 200 directamente.
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`[webhook] ${topic} recibido para ${shop}`);

  return new Response();
};
