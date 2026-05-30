-- CreateEnum
CREATE TYPE "RenderType" AS ENUM ('POPUP', 'EMBEDDED');

-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('PRODUCTS', 'VARIANTS', 'COLLECTIONS', 'ALL');

-- CreateTable
CREATE TABLE "Warning" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "allowCheckout" BOOLEAN NOT NULL DEFAULT true,
    "renderType" "RenderType" NOT NULL DEFAULT 'POPUP',
    "content" TEXT NOT NULL DEFAULT '',
    "specialLineItemText" TEXT,
    "designOverride" JSONB,
    "scheduleStart" TIMESTAMP(3),
    "scheduleEnd" TIMESTAMP(3),
    "visibilityOnAddToCart" BOOLEAN NOT NULL DEFAULT true,
    "visibilityOnBuyNow" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarningTarget" (
    "id" TEXT NOT NULL,
    "warningId" TEXT NOT NULL,
    "targetType" "TargetType" NOT NULL DEFAULT 'ALL',
    "targetIds" TEXT[],

    CONSTRAINT "WarningTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopSettings" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "appEmbedEnabled" BOOLEAN NOT NULL DEFAULT false,
    "addToCartSelector" TEXT NOT NULL DEFAULT '',
    "customCSS" TEXT,
    "showOnCollectionPages" BOOLEAN NOT NULL DEFAULT true,
    "designDefaults" JSONB,
    "storefrontApiToken" TEXT,
    "planName" TEXT NOT NULL DEFAULT 'FREE',
    "planCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopSettings_shop_key" ON "ShopSettings"("shop");

-- AddForeignKey
ALTER TABLE "WarningTarget" ADD CONSTRAINT "WarningTarget_warningId_fkey" FOREIGN KEY ("warningId") REFERENCES "Warning"("id") ON DELETE CASCADE ON UPDATE CASCADE;
