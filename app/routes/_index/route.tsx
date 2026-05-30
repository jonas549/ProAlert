import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import i18n from "../../i18n";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }
  return null;
};

export default function Landing() {
  const t = i18n.landing;

  return (
    <div style={styles.page}>
      {/* Hero */}
      <header style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.badge}>Shopify App</div>
          <h1 style={styles.heroTitle}>{t.heroTitulo}</h1>
          <p style={styles.heroTagline}>{t.heroTagline}</p>
          <a
            href="https://apps.shopify.com/"
            style={styles.ctaBtn}
            rel="noopener noreferrer"
          >
            {t.ctaInstalar}
          </a>
        </div>
      </header>

      {/* Features */}
      <section style={styles.features}>
        <div style={styles.featuresGrid}>
          <div style={styles.card}>
            <div style={styles.cardIcon}>🛒</div>
            <h3 style={styles.cardTitle}>{t.feature1Titulo}</h3>
            <p style={styles.cardDesc}>{t.feature1Desc}</p>
          </div>
          <div style={styles.card}>
            <div style={styles.cardIcon}>⚙️</div>
            <h3 style={styles.cardTitle}>{t.feature2Titulo}</h3>
            <p style={styles.cardDesc}>{t.feature2Desc}</p>
          </div>
          <div style={styles.card}>
            <div style={styles.cardIcon}>🔒</div>
            <h3 style={styles.cardTitle}>{t.feature3Titulo}</h3>
            <p style={styles.cardDesc}>{t.feature3Desc}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          {t.footerSoporte}{" "}
          <a
            href={`mailto:${i18n.soporte.email}`}
            style={styles.footerLink}
          >
            {i18n.soporte.email}
          </a>
        </p>
        <p style={styles.footerText}>{t.footerDerechos}</p>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    margin: 0,
    padding: 0,
    color: "#202223",
  },
  hero: {
    backgroundColor: "#008060",
    color: "#fff",
    padding: "80px 24px",
    textAlign: "center",
  },
  heroInner: {
    maxWidth: "640px",
    margin: "0 auto",
  },
  badge: {
    display: "inline-block",
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#fff",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 500,
    marginBottom: "20px",
  },
  heroTitle: {
    fontSize: "clamp(28px, 5vw, 44px)",
    fontWeight: 700,
    margin: "0 0 16px",
    lineHeight: 1.2,
  },
  heroTagline: {
    fontSize: "18px",
    opacity: 0.9,
    margin: "0 0 32px",
    lineHeight: 1.6,
  },
  ctaBtn: {
    display: "inline-block",
    backgroundColor: "#fff",
    color: "#008060",
    padding: "12px 28px",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "15px",
    textDecoration: "none",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  features: {
    padding: "64px 24px",
    backgroundColor: "#f9fafb",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px",
    maxWidth: "960px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "28px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  cardIcon: {
    fontSize: "32px",
    marginBottom: "12px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: 600,
    margin: "0 0 8px",
    color: "#202223",
  },
  cardDesc: {
    fontSize: "14px",
    color: "#6d7175",
    lineHeight: 1.6,
    margin: 0,
  },
  footer: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    padding: "32px 24px",
    textAlign: "center",
  },
  footerText: {
    margin: "4px 0",
    fontSize: "14px",
    opacity: 0.8,
  },
  footerLink: {
    color: "#5dd4b3",
    textDecoration: "none",
  },
};
