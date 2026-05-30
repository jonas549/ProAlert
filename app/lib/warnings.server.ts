import prisma from "./db";
import type { RenderType, TargetType } from "@prisma/client";

export type WarningInput = {
  name: string;
  allowCheckout: boolean;
  renderType: RenderType;
  content: string;
  specialLineItemText?: string;
  designOverride?: object | null;
  scheduleStart?: Date | null;
  scheduleEnd?: Date | null;
  visibilityOnAddToCart: boolean;
  visibilityOnBuyNow: boolean;
  isActive: boolean;
  targets: { targetType: TargetType; targetIds: string[] }[];
};

export async function getWarnings(shop: string) {
  return prisma.warning.findMany({
    where: { shop },
    include: { targets: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getWarning(id: string, shop: string) {
  return prisma.warning.findFirst({
    where: { id, shop },
    include: { targets: true },
  });
}

export async function createWarning(shop: string, data: WarningInput) {
  const { targets, ...w } = data;
  return prisma.warning.create({
    data: {
      shop,
      name: w.name,
      allowCheckout: w.allowCheckout,
      renderType: w.renderType,
      content: w.content,
      specialLineItemText: w.specialLineItemText,
      designOverride: w.designOverride ?? undefined,
      scheduleStart: w.scheduleStart ?? undefined,
      scheduleEnd: w.scheduleEnd ?? undefined,
      visibilityOnAddToCart: w.visibilityOnAddToCart,
      visibilityOnBuyNow: w.visibilityOnBuyNow,
      isActive: w.isActive,
      targets: {
        create: targets.map((t) => ({ targetType: t.targetType, targetIds: t.targetIds })),
      },
    },
    include: { targets: true },
  });
}

export async function updateWarning(id: string, shop: string, data: WarningInput) {
  const { targets, ...w } = data;
  await prisma.warningTarget.deleteMany({ where: { warningId: id } });
  return prisma.warning.update({
    where: { id },
    data: {
      name: w.name,
      allowCheckout: w.allowCheckout,
      renderType: w.renderType,
      content: w.content,
      specialLineItemText: w.specialLineItemText,
      designOverride: w.designOverride ?? undefined,
      scheduleStart: w.scheduleStart ?? undefined,
      scheduleEnd: w.scheduleEnd ?? undefined,
      visibilityOnAddToCart: w.visibilityOnAddToCart,
      visibilityOnBuyNow: w.visibilityOnBuyNow,
      isActive: w.isActive,
      targets: {
        create: targets.map((t) => ({ targetType: t.targetType, targetIds: t.targetIds })),
      },
    },
    include: { targets: true },
  });
}

export async function deleteWarning(id: string, _shop: string) {
  return prisma.warning.delete({ where: { id } });
}

export async function toggleWarning(id: string, _shop: string, isActive: boolean) {
  return prisma.warning.update({ where: { id }, data: { isActive } });
}

export async function countWarnings(shop: string) {
  return prisma.warning.count({ where: { shop } });
}

export async function getActiveWarningsForStorefront(shop: string) {
  const now = new Date();
  return prisma.warning.findMany({
    where: {
      shop,
      isActive: true,
      OR: [
        { scheduleStart: null, scheduleEnd: null },
        { scheduleStart: { lte: now }, scheduleEnd: null },
        { scheduleStart: null, scheduleEnd: { gte: now } },
        { scheduleStart: { lte: now }, scheduleEnd: { gte: now } },
      ],
    },
    select: {
      id: true,
      name: true,
      allowCheckout: true,
      renderType: true,
      content: true,
      specialLineItemText: true,
      designOverride: true,
      visibilityOnAddToCart: true,
      visibilityOnBuyNow: true,
      targets: { select: { targetType: true, targetIds: true } },
    },
  });
}
