// Deep link al theme editor para activar el App Embed.
// Formato vigente (2025/2026):
// https://{shop}/admin/themes/current/editor?context=apps&activateAppId={clientId}/{blockHandle}
// blockHandle = nombre del archivo en extensions/.../blocks/ sin .liquid
const APP_EMBED_BLOCK_HANDLE = "app-embed";

export function getThemeEditorEmbedUrl(shop: string, apiKey: string): string {
  return (
    `https://${shop}/admin/themes/current/editor` +
    `?context=apps&activateAppId=${apiKey}/${APP_EMBED_BLOCK_HANDLE}`
  );
}
