import type { ButtonHTMLAttributes } from "react";

type BtnVariant = "primary" | "secondary" | "muted" | "destructive";

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
}

const styles: Record<BtnVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: "#008060",
    color: "#fff",
    border: "1px solid #006e52",
  },
  secondary: {
    backgroundColor: "#f6f6f7",
    color: "#202223",
    border: "1px solid #c9cccf",
  },
  muted: {
    backgroundColor: "transparent",
    color: "#6d7175",
    border: "1px solid #c9cccf",
  },
  destructive: {
    backgroundColor: "#FED3D1",
    color: "#D72C0D",
    border: "1px solid #D72C0D",
  },
};

const base: React.CSSProperties = {
  padding: "5px 12px",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  transition: "opacity 0.15s ease",
  lineHeight: "20px",
};

export default function Btn({
  variant = "primary",
  children,
  style,
  disabled,
  ...rest
}: BtnProps) {
  return (
    <button
      {...rest}
      disabled={disabled}
      style={{
        ...base,
        ...styles[variant],
        ...(disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}),
        ...style,
      }}
    >
      {children}
    </button>
  );
}
