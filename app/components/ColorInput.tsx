interface ColorInputProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

export default function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 13, color: "#6d7175", marginBottom: 4 }}>
        {label}
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 36, height: 36, padding: 2, border: "1px solid #c9cccf", borderRadius: 6, cursor: "pointer" }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v);
          }}
          style={{ width: 90, padding: "4px 8px", border: "1px solid #c9cccf", borderRadius: 6, fontSize: 13, fontFamily: "monospace" }}
        />
      </div>
    </div>
  );
}
