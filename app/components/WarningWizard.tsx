import { useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
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

  const summaryPanel = (
    <div style={{ padding: 16, background: "#f6f6f7", borderRadius: 8 }}>
      <strong style={{ fontSize: 14, display: "block", marginBottom: 12 }}>{t.summaryTitle}</strong>
      <div style={{ fontSize: 13, color: "#6d7175" }}>
        <div style={{ marginBottom: 6 }}>
          <span style={{ color: "#202223" }}>{t.summaryNombre}: </span>
          {data.name || "—"}
        </div>
        <div style={{ marginBottom: 6 }}>
          <span style={{ color: "#202223" }}>{t.summaryTipo}: </span>
          {data.renderType === "POPUP" ? t.renderTypePopup : t.renderTypeEmbebido}
        </div>
        <div style={{ marginBottom: 6 }}>
          <span style={{ color: "#202223" }}>{t.summaryTargeting}: </span>
          {data.targetType === "ALL"
            ? i18n.warnings.targetingTodos
            : `${data.targetIds.length} seleccionados`}
        </div>
        <div>
          <span style={{ color: "#202223" }}>{t.summaryVisibilidad}: </span>
          {[
            data.visibilityOnAddToCart && "Add to Cart",
            data.visibilityOnBuyNow && "Buy Now",
          ]
            .filter(Boolean)
            .join(", ") || "—"}
        </div>
      </div>
    </div>
  );

  /* ── STEP 1: CONTENT ── */
  const step1 = (
    <div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>{t.nombreLabel}</label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => set("name")(e.target.value)}
          placeholder={t.nombrePlaceholder}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={data.allowCheckout}
            onChange={(e) => set("allowCheckout")(e.target.checked)}
            style={{ accentColor: "#008060" }}
          />
          {t.permitirCheckoutLabel}
        </label>
        <p style={hintStyle}>{t.permitirCheckoutHint}</p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>{t.renderTypeLabel}</label>
        <div style={{ display: "flex", gap: 12 }}>
          {(["POPUP", "EMBEDDED"] as RenderType[]).map((rt) => (
            <label
              key={rt}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                border: `2px solid ${data.renderType === rt ? "#008060" : "#c9cccf"}`,
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
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
              {rt === "POPUP" ? t.renderTypePopup : t.renderTypeEmbebido}
            </label>
          ))}
        </div>
        {data.renderType === "EMBEDDED" && !isUnlimited && (
          <p style={{ ...hintStyle, color: "#D72C0D" }}>
            Los warnings embebidos requieren el plan Unlimited.
          </p>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>{t.visibilidadLabel}</label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer", fontSize: 14 }}>
          <input
            type="checkbox"
            checked={data.visibilityOnAddToCart}
            onChange={(e) => set("visibilityOnAddToCart")(e.target.checked)}
            style={{ accentColor: "#008060" }}
          />
          {t.visibilidadAddToCart}
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
          <input
            type="checkbox"
            checked={data.visibilityOnBuyNow}
            onChange={(e) => set("visibilityOnBuyNow")(e.target.checked)}
            style={{ accentColor: "#008060" }}
          />
          {t.visibilidadBuyNow}
          <span
            title={t.visibilidadBuyNowTooltip}
            style={{ fontSize: 12, color: "#6d7175", cursor: "help" }}
          >
            (?)
          </span>
        </label>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>{t.contenidoLabel}</label>
        <RichTextEditor value={data.content} onChange={set("content")} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>{t.lineItemLabel}</label>
        <input
          type="text"
          value={data.specialLineItemText}
          onChange={(e) => set("specialLineItemText")(e.target.value)}
          placeholder={t.lineItemPlaceholder}
          style={inputStyle}
        />
      </div>
    </div>
  );

  /* ── STEP 2: TARGETING ── */
  const targetOptions: { value: TargetType; label: string; requiresPlan?: string }[] = [
    { value: "PRODUCTS", label: t.targetTypeProductos },
    { value: "VARIANTS", label: t.targetTypeVariantes },
    { value: "ALL", label: t.targetTypeTodos },
    { value: "COLLECTIONS", label: t.targetTypeColecciones, requiresPlan: "UNLIMITED" },
  ];

  const step2 = (
    <div>
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>{t.dateTargetingLabel}</label>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ ...labelStyle, fontWeight: 400 }}>{t.dateStartLabel}</label>
            <input
              type="datetime-local"
              value={data.scheduleStart}
              onChange={(e) => set("scheduleStart")(e.target.value)}
              style={inputStyle}
              disabled={!isUnlimited}
            />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ ...labelStyle, fontWeight: 400 }}>{t.dateEndLabel}</label>
            <input
              type="datetime-local"
              value={data.scheduleEnd}
              onChange={(e) => set("scheduleEnd")(e.target.value)}
              style={inputStyle}
              disabled={!isUnlimited}
            />
          </div>
        </div>
        {!isUnlimited && (
          <p style={{ ...hintStyle, color: "#D72C0D" }}>
            El targeting por fecha/hora requiere el plan Unlimited.
          </p>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>{t.targetTypeLabel}</label>
        {targetOptions.map((opt) => {
          const locked = !!opt.requiresPlan && !isUnlimited;
          return (
            <label
              key={opt.value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
                cursor: locked ? "not-allowed" : "pointer",
                fontSize: 14,
                opacity: locked ? 0.5 : 1,
              }}
            >
              <input
                type="radio"
                name="targetType"
                value={opt.value}
                checked={data.targetType === opt.value}
                onChange={() => !locked && set("targetType")(opt.value)}
                disabled={locked}
                style={{ accentColor: "#008060" }}
              />
              {opt.label}
              {locked && (
                <span style={{ fontSize: 11, color: "#6d7175" }}>
                  (Unlimited)
                </span>
              )}
            </label>
          );
        })}
      </div>

      {data.targetType !== "ALL" && (
        <div style={{ marginBottom: 16 }}>
          <s-button
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
          </s-button>
          {data.targetIds.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <p style={hintStyle}>
                {data.targetIds.length}{" "}
                {data.targetType === "PRODUCTS"
                  ? t.productosSeleccionados
                  : data.targetType === "VARIANTS"
                  ? t.variantesSeleccionadas
                  : t.coleccionesSeleccionadas}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                {data.targetIds.slice(0, 8).map((item) => (
                  <span
                    key={item.id}
                    style={{
                      padding: "2px 8px",
                      background: "#e6f4f0",
                      borderRadius: 12,
                      fontSize: 12,
                      color: "#008060",
                    }}
                  >
                    {item.title}
                  </span>
                ))}
                {data.targetIds.length > 8 && (
                  <span style={{ fontSize: 12, color: "#6d7175" }}>
                    +{data.targetIds.length - 8} más
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  /* ── STEP 3: DESIGN ── */
  const step3 = (
    <DesignPanel
      design={data.design}
      onChange={set("design")}
    />
  );

  const steps = [step1, step2, step3];
  const canNext =
    step === 0 ? data.name.trim().length > 0 : true;

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      {/* Main panel */}
      <div style={{ flex: "1 1 0", minWidth: 0 }}>
        {/* Step indicator */}
        <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "2px solid #e1e3e5" }}>
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
        </div>

        {steps[step]}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, paddingTop: 16, borderTop: "1px solid #e1e3e5" }}>
          <div>
            {step > 0 && (
              <s-button onClick={() => setStep((s) => s - 1)}>
                {t.anterior}
              </s-button>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {step < 2 ? (
              <s-button
                variant="primary"
                onClick={() => canNext && setStep((s) => s + 1)}
                disabled={!canNext}
              >
                {t.siguiente}
              </s-button>
            ) : (
              <s-button
                variant="primary"
                onClick={() => onSubmit(data)}
                loading={isSubmitting}
              >
                {t.guardar}
              </s-button>
            )}
          </div>
        </div>
      </div>

      {/* Right panel: Preview + Summary */}
      <div style={{ width: 320, flexShrink: 0 }}>
        <div style={{ marginBottom: 16 }}>
          <strong style={{ fontSize: 14, display: "block", marginBottom: 8 }}>
            {t.previewTitle}
          </strong>
          <WarningPreview
            content={data.content}
            design={data.design}
            renderType={data.renderType}
          />
        </div>
        {summaryPanel}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#202223",
  marginBottom: 4,
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 10px",
  border: "1px solid #c9cccf",
  borderRadius: 6,
  fontSize: 14,
  boxSizing: "border-box",
};
const hintStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#6d7175",
  marginTop: 4,
  marginBottom: 0,
};
