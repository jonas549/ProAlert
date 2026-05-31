# DECISIONS — ProAlert

## Stack

**PostgreSQL / Neon en lugar de SQLite**
El template usa SQLite por defecto pero Vercel es serverless: SQLite no funciona en producción. Neon ofrece PostgreSQL serverless con connection pooling.

**Prisma singleton en `app/lib/db/index.ts`**
El patrón singleton evita agotar el pool de conexiones de Neon en funciones serverless.

**`ApiVersion.April26` (2026-04)**
Es la versión más reciente disponible en el enum del paquete. El toml usa `"2026-04"` para consistencia.

**`read_products` como único scope**
Verificado en la documentación oficial: cubre productos, variantes Y colecciones. Principio de mínimos privilegios.

## Estrategia de comunicación Admin ↔ Storefront

**Elegida: App Proxy** (`/apps/proalert/api/warnings`)

Alternativas evaluadas:
- **Metafields de tienda** → Requiere `write_metafields` scope adicional y complejidad de sincronización.
- **Script tag con JSON estático** → No es dinámico, requiere invalidación manual de cache.
- **Storefront API** → Requiere Storefront API token (un secreto adicional a gestionar, complejidad extra). No justificado para v1.

**App Proxy** es la opción correcta porque:
1. Shopify autentica la solicitud automáticamente (firma HMAC)
2. Los datos son siempre frescos (con cache en sessionStorage de 5 min en cliente)
3. No requiere scopes adicionales
4. Compatible con `authenticate.public.appProxy(request)` del paquete oficial

La clave `window.__proalert.apiUrl = '/apps/proalert/api/warnings'` se inyecta en el liquid del embed block y el JS la usa para el fetch.

## Renderizado: Pop-up vs Embebido

**Pop-up (POPUP):**
- Se renderiza como un overlay modal centrado en la pantalla.
- Cubre toda la UI → máxima atención.
- Recomendado para warnings críticos (productos de alcohol, medicamentos, legales).
- Funciona en todas las superficies sin depender del DOM del tema.

**Embebido (EMBEDDED):**
- Se inserta en el DOM justo antes del botón Add to Cart (via `btn.parentNode.insertBefore(container, btn)`).
- Más sutil, menos disruptivo.
- Recomendado para avisos informativos que no necesitan bloquear la experiencia.
- Requiere que el tema tenga una estructura DOM predecible cerca del botón.
- Solo disponible en plan Unlimited (diferenciador de valor).

## Detección de botones en todas las superficies

El selector configurable por defecto cubre los principales temas de Shopify:
```
form[action*="/cart/add"] [type=submit], .product-form__submit, button[name="add"], 
.add_to_cart, [data-action="add-to-cart"], .btn-add-to-cart
```

**MutationObserver**: se reconfigura en cada cambio del DOM para capturar botones añadidos dinámicamente por quick-add, infinite scroll y product feeds — este es el diferenciador clave vs Warnify Pro.

## Billing / Planes

**Implementación actual**: Lazy check del plan con cache de 15 min en `ShopSettings.planCheckedAt`.
- Se consulta `currentAppInstallation.activeSubscriptions` via Admin API
- Plan "UNLIMITED" detectado si el nombre de la suscripción activa contiene "unlimited"
- Sin suscripción activa = plan "FREE"

**Pending**: Configurar los planes en el Partner Dashboard bajo "Managed Pricing". Los planes se llaman exactamente "Free" y "Unlimited" (case-insensitive match en el código).

## Storefront API Token

**Decisión: NO usar Storefront API token en v1.**
El App Proxy cubre el caso de uso de datos dinámicos sin necesidad de un token adicional. Si en v2 se necesita acceso directo al catálogo desde el cliente (para enriquecer el contenido del warning con datos del producto en tiempo real), se puede añadir el token como campo opcional en ShopSettings.

## Webhooks GDPR con `compliance_topics`

Shopify requiere 3 webhooks GDPR para apps en el App Store. Se usan `compliance_topics` (no `topics`) en el toml.

## Polaris React vs App Bridge Web Components

Se usa **`@shopify/polaris` v13 React components** para todas las vistas del admin, con `AppProvider` de Polaris para contexto i18n (español). Se mantiene el `AppBridgeProvider` de `@shopify/shopify-app-react-router` para el shell embedded y `<s-app-nav>` para la sidebar de Shopify Admin.

Los web components (`s-*`) y los componentes React de Polaris pueden coexistir en el mismo árbol. El nav lateral usa web components (integración con Shopify Admin frame); el contenido de las páginas usa Polaris React.

**Componentes Polaris usados:**
- `Page` + `Layout` + `Layout.Section` + `Layout.AnnotatedSection` — estructura de páginas
- `IndexTable` + `useIndexResourceState` — lista de Warnings
- `EmptyState` — estado vacío
- `Banner` — alertas de embed status
- `Card`, `BlockStack`, `InlineStack` — layout de contenido
- `Tabs`, `TextField`, `Checkbox`, `Select`, `FormLayout` — formularios
- `Badge` — estados de Warnings
- `PageActions` — acciones sticky en Settings

## Deep link App Embed

Formato vigente para activar el App Embed en el theme editor:
```
https://{shop}/admin/themes/current/editor?context=apps&activateAppId={clientId}/{blockHandle}
```
- `clientId` = `76290212e01f7e4535a9e3413a2002da`
- `blockHandle` = `app-embed` (nombre del archivo `blocks/app-embed.liquid` sin extensión)

La función `getThemeEditorEmbedUrl(shop, apiKey)` en `app/lib/theme-editor.ts` centraliza esta lógica.

## App Proxy — ruta catch-all

La ruta `app/routes/app-proxy.tsx` maneja TODOS los paths del proxy (`/app-proxy`, `/app-proxy/*`). La versión anterior usaba `app-proxy.api.warnings.tsx` que solo manejaba `/app-proxy/api/warnings` y dejaba `/app-proxy` sin match.

## App Embed Block vs App Block

Se usa **App Embed Block** (`"target": "body"`) en lugar de App Block porque:
- El embed block se activa una vez en "App embeds" y aplica a todo el tema
- No requiere que el merchant lo agregue manualmente a cada sección
- Es la UX correcta para un widget de comportamiento global como warnings
