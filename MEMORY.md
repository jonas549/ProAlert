# MEMORY — ProAlert

Archivo de contexto persistente para continuar el desarrollo entre sesiones.

## App

- **Nombre:** ProAlert — Product Warnings
- **client_id:** `76290212e01f7e4535a9e3413a2002da`
- **Organización Partners:** appsdevelopers (ID: 193860913)
- **Slug:** pro-alert-product-warnings
- **Email soporte:** contacto@appsdeveloperspro.com

## Stack

- React Router v7 + TypeScript (strict)
- PostgreSQL en Neon (proyecto: proalertshopify, branch: production)
- Prisma 6 (singleton en `app/lib/db/index.ts`)
- Hosting final: Vercel
- API version: `2026-04` (ApiVersion.April26)

## Estructura clave

```
app/
  lib/
    db/index.ts       # Singleton Prisma — SIEMPRE usar este
    shopify/index.ts  # Re-exports de shopify.server
  components/
    Btn.tsx           # Sistema de diseño base
  i18n.ts             # TODAS las strings van aquí
  shopify.server.ts   # Config Shopify
  routes/
    app.tsx           # Layout + nav (4 ítems)
    app._index.tsx    # Inicio (KPIs)
    app.avisos.tsx    # Feature principal (placeholder)
    app.analiticas.tsx
    app.soporte.tsx
    _index/route.tsx  # Landing pública
    webhooks.*.tsx    # 5 webhooks
```

## Reglas invariantes

1. Nunca crear PrismaClient fuera de `app/lib/db/index.ts`
2. Nunca hardcodear strings — todo en `app/i18n.ts`
3. Nunca hardcodear "$" — usar Intl.NumberFormat con currency del Shop
4. Todos los loaders/actions de /app/* deben tener `authenticate.admin(request)`
5. Todos los webhooks deben usar `authenticate.webhook(request)` (valida HMAC)

## Siguiente fase: Feature de Avisos

Ver PROGRESS.md → Fase 2
