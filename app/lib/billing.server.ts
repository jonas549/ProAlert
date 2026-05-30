import prisma from "./db";
import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";
import type { PlanName } from "./types";
import { PLAN_LIMITS } from "./types";

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function getCurrentPlan(
  shop: string,
  admin: AdminApiContext
): Promise<PlanName> {
  const settings = await prisma.shopSettings.findUnique({ where: { shop } });
  const now = new Date();

  if (
    settings?.planCheckedAt &&
    now.getTime() - settings.planCheckedAt.getTime() < CACHE_TTL_MS
  ) {
    return (settings.planName as PlanName) ?? "FREE";
  }

  let planName: PlanName = "FREE";

  try {
    const response = await admin.graphql(`
      query {
        currentAppInstallation {
          activeSubscriptions {
            name
            status
          }
        }
      }
    `);
    const data = await response.json();
    const subs =
      data?.data?.currentAppInstallation?.activeSubscriptions ?? [];
    const active = subs.find(
      (s: { status: string }) => s.status === "ACTIVE"
    );
    if (active?.name?.toLowerCase().includes("unlimited")) {
      planName = "UNLIMITED";
    }
  } catch {
    // Keep cached value on error
  }

  await prisma.shopSettings.upsert({
    where: { shop },
    create: { shop, planName, planCheckedAt: now },
    update: { planName, planCheckedAt: now },
  });

  return planName;
}

export async function canCreateWarning(
  shop: string,
  admin: AdminApiContext
): Promise<{ allowed: boolean; plan: PlanName }> {
  const plan = await getCurrentPlan(shop, admin);
  const count = await prisma.warning.count({ where: { shop } });
  const allowed = count < PLAN_LIMITS[plan].warnings;
  return { allowed, plan };
}
