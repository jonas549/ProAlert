# DECISIONS — ProAlert

## Stack

**PostgreSQL / Neon en lugar de SQLite**
El template usa SQLite por defecto pero Vercel es serverless: SQLite no funciona en producción. Neon ofrece PostgreSQL serverless con connection pooling.

**Prisma singleton en `app/lib/db/index.ts`**
El patrón singleton evita agotar el pool de conexiones de Neon en funciones serverless (cada invocación crearía un cliente nuevo sin el singleton). `db.server.ts` re-exporta desde ahí para compatibilidad con imports existentes.

**`ApiVersion.April26` (2026-04)**
Es la versión más reciente disponible en el enum del paquete `@shopify/shopify-api`. El toml usa `"2026-04"` para consistencia. La versión `2026-07` del scaffold es futura (se lanza en julio 2026).

**`read_products` como único scope**
Verificado en la documentación oficial: `read_products` cubre productos, variantes Y colecciones. No se necesitan scopes adicionales para el targeting de avisos. Principio de mínimos privilegios para el App Store review.

**Webhooks GDPR con `compliance_topics`**
Shopify requiere 3 webhooks GDPR para apps en el App Store. Se usan `compliance_topics` (no `topics`) en el toml, con endpoints separados para claridad de código y logs.

**`app/uninstalled` pausa en lugar de borrar**
La uninstalación pausa al merchant invalidando el access token, pero no borra sus datos. Esto sigue el patrón de las mejores prácticas del App Store (48h de gracia). El `shop/redact` de GDPR es quien elimina en cascada.

**No `write_products`**
La app no necesita escribir productos. El scope mínimo reduce la fricción de instalación y el riesgo de rechazo en el review.

**`vercel.json` con framework "react-router"**
Vercel tiene soporte nativo para React Router v7. Con `"framework": "react-router"`, detecta automáticamente la estructura y no requiere configuración adicional de build.
