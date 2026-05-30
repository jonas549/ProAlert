# PROGRESS — ProAlert

## Fase 1: Setup inicial del cascarón ✅

- [x] Scaffold con `shopify app init --template reactRouter --flavor typescript`
- [x] App creada en Partner Dashboard (client_id: `76290212e01f7e4535a9e3413a2002da`)
- [x] Archivos movidos directamente a `C:\Users\Jonas\Documents\ProAlert`
- [x] TypeScript strict mode activado (ya venía en el template)
- [x] `shopify.app.toml` actualizado: scopes → `read_products`, GDPR webhooks, api_version `2026-04`
- [x] Prisma schema → PostgreSQL + Neon (Session + Shop models)
- [x] `.env` creado con todas las variables
- [x] Singleton de Prisma en `app/lib/db/index.ts`
- [x] `app/db.server.ts` re-exporta desde lib/db
- [x] `app/shopify.server.ts` → ApiVersion.April26
- [x] `app/i18n.ts` creado (fuente única de strings en español LATAM)
- [x] `app/components/Btn.tsx` con variantes primary/secondary/muted/destructive
- [x] Navegación en español: Inicio, Avisos, Analíticas, Soporte
- [x] 4 rutas de admin: app._index, app.avisos, app.analiticas, app.soporte
- [x] 5 webhooks: app/uninstalled, app/scopes_update, customers/data_request, customers/redact, shop/redact
- [x] Landing pública en español (`_index/route.tsx`)
- [x] `vercel.json` con framework react-router
- [x] Migración Prisma corrida contra Neon ← PENDIENTE
- [x] Build limpio ← PENDIENTE VERIFICAR
- [x] git commit local ← PENDIENTE

## Fase 2: Features (próximo)

- [ ] Modelo `Warning` (avisos con targeting por producto/variante/colección)
- [ ] UI de gestión de avisos (CRUD)
- [ ] Script del tema (App Embed Block / ScriptTag)
- [ ] Lógica de detección en todas las superficies de add-to-cart
- [ ] Analíticas reales
