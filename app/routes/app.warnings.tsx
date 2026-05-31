import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate, useFetcher } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import {
  Page,
  Layout,
  Card,
  Banner,
  Badge,
  Button,
  IndexTable,
  EmptyState,
  Tabs,
  Text,
  BlockStack,
  InlineStack,
  TextField,
  useIndexResourceState,
  IndexTableSelectionType,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getWarnings, deleteWarning, toggleWarning } from "../lib/warnings.server";
import { getShopSettings } from "../lib/shop-settings.server";
import { getThemeEditorEmbedUrl } from "../lib/theme-editor";
import i18n from "../i18n";
import type { Warning, WarningTarget } from "@prisma/client";
import { useState, useCallback } from "react";

type WW = Warning & { targets: WarningTarget[] };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const [warnings, settings] = await Promise.all([
    getWarnings(session.shop),
    getShopSettings(session.shop),
  ]);
  const themeEditorUrl = getThemeEditorEmbedUrl(
    session.shop,
    // eslint-disable-next-line no-undef
    process.env.SHOPIFY_API_KEY || ""
  );
  return { warnings, embedEnabled: settings.appEmbedEnabled, themeEditorUrl };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  const intent = form.get("intent") as string;
  if (intent === "delete") await deleteWarning(form.get("id") as string, session.shop);
  if (intent === "toggle")
    await toggleWarning(form.get("id") as string, session.shop, form.get("isActive") === "true");
  return null;
};

function targetingLabel(w: WW) {
  const t = w.targets[0];
  if (!t || t.targetType === "ALL") return i18n.warnings.targetingTodos;
  const n = t.targetIds.length;
  if (t.targetType === "PRODUCTS") return `${n} ${i18n.warnings.targetingProductos}`;
  if (t.targetType === "VARIANTS") return `${n} ${i18n.warnings.targetingVariantes}`;
  return `${n} ${i18n.warnings.targetingColecciones}`;
}

function statusBadge(w: WW) {
  const invalid =
    w.targets[0] && w.targets[0].targetType !== "ALL" && w.targets[0].targetIds.length === 0;
  if (!w.isActive) return { tone: "info" as const, label: i18n.warnings.estadoInactivo };
  if (invalid) return { tone: "critical" as const, label: i18n.warnings.estadoInvalidTargeting };
  return { tone: "success" as const, label: i18n.warnings.estadoActivo };
}

const TABS = [
  { id: "all", content: i18n.warnings.tabTodos, panelID: "all" },
  { id: "active", content: i18n.warnings.tabActivos, panelID: "active" },
  { id: "inactive", content: i18n.warnings.tabInactivos, panelID: "inactive" },
];

export default function WarningsList() {
  const { warnings, embedEnabled, themeEditorUrl } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [tabIdx, setTabIdx] = useState(0);
  const [search, setSearch] = useState("");

  const filtered = (warnings as WW[]).filter((w) => {
    const tab = TABS[tabIdx].id;
    if (tab === "active" && !w.isActive) return false;
    if (tab === "inactive" && w.isActive) return false;
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(filtered);

  const handleTabChange = useCallback((idx: number) => {
    setTabIdx(idx);
    handleSelectionChange(IndexTableSelectionType.All, false);
  }, [handleSelectionChange]);

  const rowMarkup = filtered.map((w, index) => {
    const { tone, label } = statusBadge(w);
    return (
      <IndexTable.Row
        id={w.id}
        key={w.id}
        selected={selectedResources.includes(w.id)}
        position={index}
        onClick={() => navigate(`/app/warnings/${w.id}/edit`)}
      >
        <IndexTable.Cell>
          <BlockStack gap="050">
            <Text as="span" variant="bodyMd" fontWeight="semibold">
              {w.name}
            </Text>
            <Text as="span" variant="bodySm" tone="subdued">
              {new Date(w.createdAt).toLocaleDateString("es")}
            </Text>
          </BlockStack>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Badge tone={tone}>{label}</Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" variant="bodyMd">
            {targetingLabel(w)}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Badge>
            {w.renderType === "POPUP" ? i18n.warnings.tipoPopup : i18n.warnings.tipoEmbebido}
          </Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <fetcher.Form method="post" onClick={(e) => e.stopPropagation()}>
            <input type="hidden" name="intent" value="toggle" />
            <input type="hidden" name="id" value={w.id} />
            <input type="hidden" name="isActive" value={String(!w.isActive)} />
            <input
              type="checkbox"
              checked={w.isActive}
              onChange={(e) => {
                const f = e.target.closest("form") as HTMLFormElement;
                fetcher.submit(f);
              }}
              style={{ width: 18, height: 18, accentColor: "#008060", cursor: "pointer" }}
            />
          </fetcher.Form>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <InlineStack gap="200">
              <Button
                size="slim"
                onClick={() => navigate(`/app/warnings/${w.id}/edit`)}
              >
                {i18n.warnings.editar}
              </Button>
              <fetcher.Form method="post">
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="id" value={w.id} />
                <Button
                  size="slim"
                  tone="critical"
                  variant="plain"
                  submit
                  onClick={() => {
                    if (!window.confirm(i18n.warnings.confirmarEliminar))
                      return false;
                  }}
                >
                  {i18n.warnings.eliminar}
                </Button>
              </fetcher.Form>
            </InlineStack>
          </div>
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  return (
    <Page
      title={i18n.warnings.titulo}
      primaryAction={
        <Button url="/app/warnings/new" variant="primary">
          {i18n.warnings.crearWarning}
        </Button>
      }
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {!embedEnabled && (
              <Banner
                title={i18n.warnings.embedBannerInactivo}
                tone="warning"
                action={{ content: i18n.warnings.activarEmbed, url: themeEditorUrl, target: "_blank" }}
              />
            )}

            <Card padding="0">
              <Tabs tabs={TABS} selected={tabIdx} onSelect={handleTabChange}>
                <div style={{ padding: "12px 16px 0" }}>
                  <TextField
                    label=""
                    labelHidden
                    placeholder={i18n.comun.buscar}
                    value={search}
                    onChange={setSearch}
                    autoComplete="off"
                    clearButton
                    onClearButtonClick={() => setSearch("")}
                  />
                </div>

                {filtered.length === 0 ? (
                  <EmptyState
                    heading={i18n.warnings.sinWarnings}
                    action={{ content: i18n.warnings.crearWarning, url: "/app/warnings/new" }}
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  >
                    <p>{i18n.warnings.sinWarningsCta}</p>
                  </EmptyState>
                ) : (
                  <IndexTable
                    resourceName={{ singular: "warning", plural: "warnings" }}
                    itemCount={filtered.length}
                    selectedItemsCount={
                      allResourcesSelected ? "All" : selectedResources.length
                    }
                    onSelectionChange={handleSelectionChange}
                    headings={[
                      { title: i18n.warnings.colNombre },
                      { title: i18n.warnings.colEstado },
                      { title: i18n.warnings.colTargeting },
                      { title: i18n.warnings.colTipo },
                      { title: i18n.warnings.colActivo },
                      { title: i18n.warnings.colAcciones },
                    ]}
                  >
                    {rowMarkup}
                  </IndexTable>
                )}
              </Tabs>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export const headers: HeadersFunction = (headersArgs) =>
  boundary.headers(headersArgs);
