# PROGRESS — ProAlert

## Fase 1: Setup inicial del cascarón ✅ COMPLETO

## Fase 2: Features v1 ✅ COMPLETO

- [x] Modelos Prisma: Warning, WarningTarget, ShopSettings — migrados en Neon
- [x] Navegación: Dashboard, Warnings, Soporte
- [x] Dashboard con KPIs, estado embed, CTA rápido
- [x] Lista de Warnings con tabs, búsqueda, toggle activo/inactivo, eliminar
- [x] Wizard crear/editar Warning (3 pasos: Contenido, Targeting, Diseño)
- [x] Editor rich-text TipTap con variables {{product.title}} etc.
- [x] Resource Picker para products/variants/collections
- [x] Preview en vivo del warning (pop-up + embebido)
- [x] Settings: embed status, selector ATC, colecciones, diseño global, CSS
- [x] Billing: página de planes FREE/UNLIMITED con lazy cache 15 min
- [x] Soporte: Centro de soporte con email y tiempo de respuesta
- [x] App Proxy: GET /apps/proalert/api/warnings → JSON para storefront
- [x] Theme App Extension (app embed block) con app-embed.liquid
- [x] proalert.js: lógica completa del storefront
  - Detección de botones en TODAS las superficies (PDP, colecciones, quick-add)
  - MutationObserver para contenido dinámico
  - Modal pop-up y modo embebido
  - Line item properties
  - SessionStorage para "ya aceptado"
  - Buy Now detection
- [x] Typecheck limpio, build limpio
- [x] Commit + push a GitHub

## Pendiente para v3

- [ ] Deploy a Vercel del nuevo código
- [ ] Activar App Embed en una dev store y probar visualmente
- [ ] Configurar Managed Pricing planes en Partners Dashboard
- [ ] Analytics reales (views, confirmations, blocks)
- [ ] Webhook app/uninstalled: pausar shop en DB
- [ ] i18n multilenguaje (en-US)
