import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../lib/db";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`[webhook] ${topic} recibido para ${shop}`);

  // Pausamos la tienda (no eliminamos datos) para cumplir con las
  // políticas del App Store que exigen 48h antes de borrar datos.
  if (session) {
    await prisma.session.updateMany({
      where: { shop },
      data: { accessToken: "" },
    });
  }

  return new Response();
};
