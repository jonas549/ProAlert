import type { DesignConfig } from "../lib/types";

interface WarningPreviewProps {
  content: string;
  design: DesignConfig;
  renderType: "POPUP" | "EMBEDDED";
}

export default function WarningPreview({ content, design, renderType }: WarningPreviewProps) {
  const { cancelButton: cancel, confirmButton: confirm, modalBgColor, showCancelButton } = design;

  const btnStyle = (b: typeof cancel): React.CSSProperties => ({
    padding: "5px 12px",
    borderRadius: b.borderRadius,
    border: `${b.borderWidth}px solid ${b.borderColor}`,
    background: b.backgroundColor,
    color: b.fontColor,
    fontSize: b.fontSize,
    fontWeight: b.bold ? 700 : 400,
    cursor: "pointer",
  });

  const inner = (
    <div
      style={{
        background: modalBgColor,
        borderRadius: 12,
        padding: 24,
        maxWidth: 420,
        boxShadow: renderType === "POPUP" ? "0 8px 32px rgba(0,0,0,0.18)" : "0 1px 6px rgba(0,0,0,0.1)",
        border: renderType === "POPUP" ? "none" : "1px solid #e1e3e5",
      }}
    >
      <div
        style={{ marginBottom: 20, fontSize: 14, lineHeight: 1.6, color: "#202223" }}
        dangerouslySetInnerHTML={{ __html: content || "<p><em>Escribe el contenido del warning...</em></p>" }}
      />
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        {showCancelButton && (
          <button style={btnStyle(cancel)}>{cancel.text}</button>
        )}
        <button style={btnStyle(confirm)}>{confirm.text}</button>
      </div>
    </div>
  );

  if (renderType === "POPUP") {
    return (
      <div
        style={{
          background: "rgba(0,0,0,0.4)",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          minHeight: 220,
        }}
      >
        {inner}
      </div>
    );
  }

  return (
    <div style={{ padding: 16, background: "#f9fafb", borderRadius: 8 }}>
      <div style={{ fontSize: 11, color: "#6d7175", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
        Embebido — cerca del botón Add to Cart
      </div>
      {inner}
    </div>
  );
}
