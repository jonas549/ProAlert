import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../lib/db";

// GDPR: solicitud de eliminación de datos de una tienda (merchant).
// Eliminamos en cascada todos los datos asociados al shop.
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`[webhook] ${topic} recibido para ${shop}`);

  await prisma.session.deleteMany({ where: { shop } });
  await prisma.shop.deleteMany({ where: { domain: shop } });

  return new Response();
};
