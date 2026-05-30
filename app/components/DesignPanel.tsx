import type { DesignConfig, ButtonDesign } from "../lib/types";
import ColorInput from "./ColorInput";
import i18n from "../i18n";

interface DesignPanelProps {
  design: DesignConfig;
  onChange: (d: DesignConfig) => void;
}

function SliderField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6d7175", marginBottom: 4 }}>
        <span>{label}</span>
        <span>{value}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#008060" }}
      />
    </div>
  );
}

function ButtonDesignPanel({
  title,
  btn,
  onChange,
  showToggle,
  toggleValue,
  onToggle,
}: {
  title: string;
  btn: ButtonDesign;
  onChange: (b: ButtonDesign) => void;
  showToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
}) {
  const t = i18n.warningForm;
  const set = (k: keyof ButtonDesign) => (v: ButtonDesign[typeof k]) =>
    onChange({ ...btn, [k]: v });

  return (
    <div style={{ border: "1px solid #e1e3e5", borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <strong style={{ fontSize: 14 }}>{title}</strong>
        {showToggle && onToggle && (
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={toggleValue}
              onChange={(e) => onToggle(e.target.checked)}
              style={{ accentColor: "#008060" }}
            />
            {t.mostrarCancelLabel}
          </label>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 13, color: "#6d7175" }}>{t.textoBtn}</label>
        <input
          type="text"
          value={btn.text}
          onChange={(e) => set("text")(e.target.value)}
          style={{ display: "block", width: "100%", marginTop: 4, padding: "5px 8px", border: "1px solid #c9cccf", borderRadius: 6, fontSize: 14 }}
        />
      </div>

      <SliderField label={t.fontSizeLabel} value={btn.fontSize} min={10} max={20} onChange={set("fontSize")} />

      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginBottom: 12, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={btn.bold}
          onChange={(e) => set("bold")(e.target.checked)}
          style={{ accentColor: "#008060" }}
        />
        {t.boldLabel}
      </label>

      <ColorInput label={t.fontColorLabel} value={btn.fontColor} onChange={set("fontColor")} />
      <ColorInput label={t.bgColorLabel} value={btn.backgroundColor} onChange={set("backgroundColor")} />
      <SliderField label={t.borderWidthLabel} value={btn.borderWidth} min={0} max={5} onChange={set("borderWidth")} />
      <ColorInput label={t.borderColorLabel} value={btn.borderColor} onChange={set("borderColor")} />
      <SliderField label={t.borderRadiusLabel} value={btn.borderRadius} min={0} max={25} onChange={set("borderRadius")} />
    </div>
  );
}

export default function DesignPanel({ design, onChange }: DesignPanelProps) {
  const t = i18n.warningForm;

  return (
    <div>
      <ButtonDesignPanel
        title={t.cancelBtnTitle}
        btn={design.cancelButton}
        onChange={(b) => onChange({ ...design, cancelButton: b })}
        showToggle
        toggleValue={design.showCancelButton}
        onToggle={(v) => onChange({ ...design, showCancelButton: v })}
      />
      <ButtonDesignPanel
        title={t.confirmBtnTitle}
        btn={design.confirmButton}
        onChange={(b) => onChange({ ...design, confirmButton: b })}
      />
      <ColorInput
        label={t.modalBgColorLabel}
        value={design.modalBgColor}
        onChange={(v) => onChange({ ...design, modalBgColor: v })}
      />
    </div>
  );
}
