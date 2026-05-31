import { useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  ButtonGroup,
  Checkbox,
  TextField,
  Select,
  FormLayout,
  Badge,
  Divider,
  Banner,
} from "@shopify/polaris";
import type { DesignConfig } from "../lib/types";
import { DEFAULT_DESIGN } from "../lib/types";
import RichTextEditor from "./RichTextEditor";
import DesignPanel from "./DesignPanel";
import WarningPreview from "./WarningPreview";
import i18n from "../i18n";

type RenderType = "POPUP" | "EMBEDDED";
type TargetType = "ALL" | "PRODUCTS" | "VARIANTS" | "COLLECTIONS";

export type WizardData = {
  name: string;
  allowCheckout: boolean;
  renderType: RenderType;
  visibilityOnAddToCart: boolean;
  visibilityOnBuyNow: boolean;
  content: string;
  specialLineItemText: string;
  scheduleStart: string;
  scheduleEnd: string;
  targetType: TargetType;
  targetIds: { id: string; title: string }[];
  design: DesignConfig;
  isActive: boolean;
};

interface WarningWizardProps {
  initialData?: Partial<WizardData>;
  onSubmit: (data: WizardData) => void;
  isSubmitting: boolean;
  planName: string;
}

const STEPS = [
  i18n.warningForm.paso1,
  i18n.warningForm.paso2,
  i18n.warningForm.paso3,
];

function empty(): WizardData {
  return {
    name: "",
    allowCheckout: true,
    renderType: "POPUP",
    visibilityOnAddToCart: true,
    visibilityOnBuyNow: false,
    content: "",
    specialLineItemText: "",
    scheduleStart: "",
    scheduleEnd: "",
    targetType: "ALL",
    targetIds: [],
    design: DEFAULT_DESIGN,
    isActive: true,
  };
}

export default function WarningWizard({
  initialData,
  onSubmit,
  isSubmitting,
  planName,
}: WarningWizardProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(() => ({ ...empty(), ...initialData }));
  const shopify = useAppBridge();
  const t = i18n.warningForm;
  const isUnlimited = planName === "UNLIMITED";

  const set = <K extends keyof WizardData>(k: K) => (v: WizardData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  async function openResourcePicker(type: "product" | "variant" | "collection") {
    const res = await shopify.resourcePicker({
      type,
      multiple: true,
      selectionIds: data.targetIds.map((x) => ({ id: x.id })),
    });
    if (res) {
      set("targetIds")(res.selection.map((r) => ({ id: r.id, title: r.title })));
    }
  }

  // ─── STEP INDICATOR ───
  const stepIndicator = (
    <InlineStack gap="0" blockAlign="center">
      {STEPS.map((s, i) => (
        <button
          key={s}
          type="button"
          onClick={() => i < step && setStep(i)}
          style={{
            padding: "8px 20px",
            border: "none",
            borderBottom: `3px solid ${i === step ? "#008060" : "transparent"}`,
            background: "transparent",
            color: i === step ? "#008060" : i < step ? "#202223" : "#6d7175",
            fontWeight: i === step ? 600 : 400,
            cursor: i < step ? "pointer" : "default",
            fontSize: 14,
          }}
        >
          {i + 1}. {s}
        </button>
      ))}
    </InlineStack>
  );

  // ─── STEP 1: CONTENT ───
  const step1 = (
    <BlockStack gap="400">
      <FormLayout>
        <TextField
          label={t.nombreLabel}
          value={data.name}
          onChange={set("name")}
          placeholder={t.nombrePlaceholder}
          autoComplete="off"
        />
      </FormLayout>

      <Checkbox
        label={t.permitirCheckoutLabel}
        helpText={t.permitirCheckoutHint}
        checked={data.allowCheckout}
        onChange={set("allowCheckout")}
      />

      <BlockStack gap="200">
        <Text as="p" variant="bodyMd" fontWeight="semibold">
          {t.renderTypeLabel}
        </Text>
        <InlineStack gap="300">
          {(["POPUP", "EMBEDDED"] as RenderType[]).map((rt) => (
            <label
              key={rt}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                border: `2px solid ${data.renderType === rt ? "#008060" : "#c9cccf"}`,
                borderRadius: 8,
                cursor: "pointer",
                background: data.renderType === rt ? "#e6f4f0" : "#fff",
              }}
            >
              <input
                type="radio"
                name="renderType"
                value={rt}
                checked={data.renderType === rt}
                onChange={() => set("renderType")(rt)}
                style={{ accentColor: "#008060" }}
              />
              <Text as="span" variant="bodyMd">
                {rt === "POPUP" ? t.renderTypePopup : t.renderTypeEmbebido}
              </Text>
            </label>
          ))}
        </InlineStack>
        {data.renderType === "EMBEDDED" && !isUnlimited && (
          <Banner tone="warning">
            <p>Los Warnings embebidos requieren el plan Unlimited.</p>
          </Banner>
        )}
      </BlockStack>

      <BlockStack gap="200">
        <Text as="p" variant="bodyMd" fontWeight="semibold">
          {t.visibilidadLabel}
        </Text>
        <Checkbox
          label={t.visibilidadAddToCart}
          checked={data.visibilityOnAddToCart}
          onChange={set("visibilityOnAddToCart")}
        />
        <Checkbox
          label={
            <span>
              {t.visibilidadBuyNow}{" "}
              <span title={t.visibilidadBuyNowTooltip} style={{ color: "#6d7175", fontSize: 12 }}>
                (?)
              </span>
            </span>
          }
          checked={data.visibilityOnBuyNow}
          onChange={set("visibilityOnBuyNow")}
        />
      </BlockStack>

      <BlockStack gap="200">
        <Text as="p" variant="bodyMd" fontWeight="semibold">
          {t.contenidoLabel}
        </Text>
        <RichTextEditor value={data.content} onChange={set("content")} />
      </BlockStack>

      <FormLayout>
        <TextField
          label={t.lineItemLabel}
          value={data.specialLineItemText}
          onChange={set("specialLineItemText")}
          placeholder={t.lineItemPlaceholder}
          autoComplete="off"
        />
      </FormLayout>
    </BlockStack>
  );

  // ─── STEP 2: TARGETING ───
  const targetOptions = [
    { value: "PRODUCTS", label: t.targetTypeProductos },
    { value: "VARIANTS", label: t.targetTypeVariantes },
    { value: "ALL", label: t.targetTypeTodos },
    {
      value: "COLLECTIONS",
      label: t.targetTypeColecciones + (!isUnlimited ? " (Unlimited)" : ""),
    },
  ];

  const step2 = (
    <BlockStack gap="400">
      {!isUnlimited && (
        <Banner tone="info">
          <p>El targeting por fecha/hora y colecciones requiere el plan Unlimited.</p>
        </Banner>
      )}

      <BlockStack gap="200">
        <Text as="p" variant="bodyMd" fontWeight="semibold">
          {t.dateTargetingLabel}
        </Text>
        <InlineStack gap="300" wrap>
          <div style={{ flex: 1, minWidth: 180 }}>
            <TextField
              label={t.dateStartLabel}
              type="datetime-local"
              value={data.scheduleStart}
              onChange={set("scheduleStart")}
              disabled={!isUnlimited}
              autoComplete="off"
            />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <TextField
              label={t.dateEndLabel}
              type="datetime-local"
              value={data.scheduleEnd}
              onChange={set("scheduleEnd")}
              disabled={!isUnlimited}
              autoComplete="off"
            />
          </div>
        </InlineStack>
      </BlockStack>

      <BlockStack gap="200">
        <Text as="p" variant="bodyMd" fontWeight="semibold">
          {t.targetTypeLabel}
        </Text>
        {targetOptions.map((opt) => {
          const locked =
            opt.value === "COLLECTIONS" && !isUnlimited;
          return (
            <label
              key={opt.value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                opacity: locked ? 0.5 : 1,
                cursor: locked ? "not-allowed" : "pointer",
              }}
            >
              <input
                type="radio"
                name="targetType"
                value={opt.value}
                checked={data.targetType === opt.value}
                onChange={() => !locked && set("targetType")(opt.value as TargetType)}
                disabled={locked}
                style={{ accentColor: "#008060" }}
              />
              <Text as="span" variant="bodyMd">
                {opt.label}
              </Text>
            </label>
          );
        })}
      </BlockStack>

      {data.targetType !== "ALL" && (
        <BlockStack gap="200">
          <Button
            onClick={() => {
              const type =
                data.targetType === "PRODUCTS"
                  ? "product"
                  : data.targetType === "VARIANTS"
                  ? "variant"
                  : "collection";
              openResourcePicker(type as "product" | "variant" | "collection");
            }}
          >
            {data.targetType === "PRODUCTS"
              ? t.seleccionarProductos
              : data.targetType === "VARIANTS"
              ? t.seleccionarVariantes
              : t.seleccionarColecciones}
          </Button>
          {data.targetIds.length > 0 && (
            <InlineStack gap="200" wrap>
              {data.targetIds.slice(0, 8).map((item) => (
                <Badge key={item.id}>{item.title}</Badge>
              ))}
              {data.targetIds.length > 8 && (
                <Text as="span" variant="bodySm" tone="subdued">
                  +{data.targetIds.length - 8} mas
                </Text>
              )}
            </InlineStack>
          )}
        </BlockStack>
      )}
    </BlockStack>
  );

  // ─── STEP 3: DESIGN ───
  const step3 = <DesignPanel design={data.design} onChange={set("design")} />;

  const steps = [step1, step2, step3];
  const canNext = step === 0 ? data.name.trim().length > 0 : true;

  // ─── SUMMARY SIDEBAR ───
  const summary = (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="300">
          <Text variant="headingMd" as="h3">
            {t.previewTitle}
          </Text>
          <WarningPreview
            content={data.content}
            design={data.design}
            renderType={data.renderType}
          />
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="300">
          <Text variant="headingMd" as="h3">
            {t.summaryTitle}
          </Text>
          <Divider />
          {[
            { label: t.summaryNombre, value: data.name || "—" },
            {
              label: t.summaryTipo,
              value:
                data.renderType === "POPUP" ? i18n.warnings.tipoPopup : i18n.warnings.tipoEmbebido,
            },
            {
              label: t.summaryTargeting,
              value:
                data.targetType === "ALL"
                  ? i18n.warnings.targetingTodos
                  : `${data.targetIds.length} seleccionados`,
            },
          ].map(({ label, value }) => (
            <InlineStack key={label} align="space-between">
              <Text as="span" variant="bodySm" tone="subdued">
                {label}
              </Text>
              <Text as="span" variant="bodySm">
                {value}
              </Text>
            </InlineStack>
          ))}
        </BlockStack>
      </Card>
    </BlockStack>
  );

  return (
    <Layout>
      <Layout.Section>
        <BlockStack gap="400">
          <Card padding="0">
            <div style={{ borderBottom: "1px solid #e1e3e5", padding: "0 4px" }}>
              {stepIndicator}
            </div>
            <div style={{ padding: 20 }}>{steps[step]}</div>
          </Card>

          <InlineStack align="space-between">
            <div>
              {step > 0 && (
                <Button onClick={() => setStep((s) => s - 1)}>{t.anterior}</Button>
              )}
            </div>
            <ButtonGroup>
              {step < 2 ? (
                <Button
                  variant="primary"
                  onClick={() => canNext && setStep((s) => s + 1)}
                  disabled={!canNext}
                >
                  {t.siguiente}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  loading={isSubmitting}
                  onClick={() => onSubmit(data)}
                >
                  {t.guardar}
                </Button>
              )}
            </ButtonGroup>
          </InlineStack>
        </BlockStack>
      </Layout.Section>

      <Layout.Section variant="oneThird">{summary}</Layout.Section>
    </Layout>
  );
}
