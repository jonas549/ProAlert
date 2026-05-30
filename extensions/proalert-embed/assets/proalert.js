/**
 * ProAlert Storefront Widget
 * Detecta botones Add to Cart en TODAS las superficies (PDP, colecciones,
 * quick-add, Buy Now) y muestra el warning correspondiente antes de proceder.
 *
 * Estrategia de datos: App Proxy (/apps/proalert/api/warnings)
 * Los warnings se cachean en sessionStorage con TTL de 5 min.
 * MutationObserver recaptura botones añadidos dinámicamente (quick-add, feeds).
 */
(function () {
  "use strict";

  const CACHE_KEY = "proalert_config";
  const CACHE_TTL = 5 * 60 * 1000;
  const SESSION_PREFIX = "proalert_accepted_";

  let config = null; // { warnings, settings }
  let observer = null;

  /* ─── INIT ─── */
  async function init() {
    if (!window.__proalert) return;
    config = await loadConfig();
    if (!config || !config.warnings || config.warnings.length === 0) return;

    injectStyles(config.settings?.customCSS ?? "");
    bindButtons();
    startObserver();
  }

  /* ─── CONFIG LOADING ─── */
  async function loadConfig() {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) return data;
      }
    } catch {}

    try {
      const res = await fetch(window.__proalert.apiUrl, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return null;
      const data = await res.json();
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
      return data;
    } catch {
      return null;
    }
  }

  /* ─── BUTTON BINDING ─── */
  function bindButtons() {
    const selector = config.settings?.addToCartSelector ||
      'form[action*="/cart/add"] [type=submit], .product-form__submit, button[name="add"], .add_to_cart, [data-action="add-to-cart"], .btn-add-to-cart';

    document.querySelectorAll(selector).forEach(attachHandler);

    // Buy Now / dynamic checkout buttons
    document.querySelectorAll(
      '[data-shopify="payment-button"] button, .shopify-payment-button button, [data-testid="Checkout-button"]'
    ).forEach((btn) => attachHandler(btn, true));
  }

  function attachHandler(btn, isBuyNow = false) {
    if (btn.__proalert_bound) return;
    btn.__proalert_bound = true;

    btn.addEventListener("click", async (e) => {
      const warning = findWarning(btn, isBuyNow);
      if (!warning) return;

      const productId = getProductId(btn);
      const sessionKey = SESSION_PREFIX + productId;

      if (sessionStorage.getItem(sessionKey) === "accepted") return;

      e.preventDefault();
      e.stopImmediatePropagation();

      const accepted = await showWarning(warning, btn);

      if (accepted) {
        sessionStorage.setItem(sessionKey, "accepted");
        injectLineItemProperty(btn, warning.specialLineItemText);
        proceedWithOriginalAction(btn, isBuyNow);
      }
    }, true);
  }

  /* ─── TARGETING MATCH ─── */
  function findWarning(btn, isBuyNow) {
    const productId = getProductId(btn);
    const variantId = getVariantId(btn);
    const collectionHandle = getCollectionHandle();

    for (const w of config.warnings) {
      if (isBuyNow && !w.visibilityOnBuyNow) continue;
      if (!isBuyNow && !w.visibilityOnAddToCart) continue;

      const t = w.targets[0];
      if (!t || t.targetType === "ALL") return w;

      if (t.targetType === "PRODUCTS" && productId && t.targetIds.includes(productId)) return w;
      if (t.targetType === "VARIANTS" && variantId && t.targetIds.includes(variantId)) return w;
      if (t.targetType === "COLLECTIONS" && collectionHandle) {
        // Match by collection handle stored as GID or handle
        if (t.targetIds.some((id) => id.includes(collectionHandle) || id === collectionHandle)) return w;
      }
    }
    return null;
  }

  function getProductId(btn) {
    // Look up the DOM tree for product data attributes or form hidden inputs
    const form = btn.closest('form[action*="/cart/add"]');
    if (form) {
      const input = form.querySelector('[name="id"], [name="product-id"], [data-product-id]');
      if (input) return String(input.value || input.getAttribute("data-product-id") || "");
    }
    return (
      btn.closest("[data-product-id]")?.getAttribute("data-product-id") ||
      document.getElementById("product-id")?.value ||
      window.ShopifyAnalytics?.meta?.product?.id?.toString() ||
      ""
    );
  }

  function getVariantId(btn) {
    const form = btn.closest('form[action*="/cart/add"]');
    if (form) {
      const sel = form.querySelector('[name="id"], select[name="id"], input[name="id"]');
      if (sel) return String(sel.value || "");
    }
    return "";
  }

  function getCollectionHandle() {
    const path = window.location.pathname;
    const match = path.match(/\/collections\/([^/]+)/);
    return match ? match[1] : null;
  }

  /* ─── MODAL / EMBEDDED RENDERING ─── */
  function showWarning(warning, btn) {
    return new Promise((resolve) => {
      const design = mergeDesign(warning.designOverride, config.settings?.designDefaults);

      if (warning.renderType === "EMBEDDED") {
        showEmbedded(warning, design, btn, resolve);
      } else {
        showModal(warning, design, resolve);
      }
    });
  }

  function mergeDesign(override, defaults) {
    const base = defaults || {
      showCancelButton: true,
      cancelButton: { text: "Cancelar", fontSize: 14, bold: false, fontColor: "#202223", backgroundColor: "#f6f6f7", borderWidth: 1, borderColor: "#c9cccf", borderRadius: 6 },
      confirmButton: { text: "Entendido", fontSize: 14, bold: false, fontColor: "#ffffff", backgroundColor: "#008060", borderWidth: 0, borderColor: "#008060", borderRadius: 6 },
      modalBgColor: "#ffffff",
    };
    if (!override) return base;
    return {
      showCancelButton: override.showCancelButton ?? base.showCancelButton,
      cancelButton: { ...base.cancelButton, ...(override.cancelButton || {}) },
      confirmButton: { ...base.confirmButton, ...(override.confirmButton || {}) },
      modalBgColor: override.modalBgColor || base.modalBgColor,
    };
  }

  function renderButtons(design, warning, resolve, container, cleanup) {
    const row = document.createElement("div");
    row.style.cssText = "display:flex;justify-content:flex-end;gap:8px;margin-top:16px;";

    if (design.showCancelButton) {
      const cancel = document.createElement("button");
      cancel.textContent = design.cancelButton.text;
      applyBtnStyle(cancel, design.cancelButton);
      cancel.onclick = () => { cleanup(); resolve(false); };
      row.appendChild(cancel);
    }

    const confirm = document.createElement("button");
    confirm.textContent = design.confirmButton.text;
    applyBtnStyle(confirm, design.confirmButton);
    confirm.onclick = () => {
      if (!warning.allowCheckout) { cleanup(); resolve(false); return; }
      cleanup(); resolve(true);
    };
    row.appendChild(confirm);
    container.appendChild(row);
  }

  function applyBtnStyle(btn, s) {
    btn.style.cssText = `
      padding:5px 12px;border-radius:${s.borderRadius}px;
      border:${s.borderWidth}px solid ${s.borderColor};
      background:${s.backgroundColor};color:${s.fontColor};
      font-size:${s.fontSize}px;font-weight:${s.bold ? 700 : 400};
      cursor:pointer;line-height:1.4;
    `;
  }

  function showModal(warning, design, resolve) {
    const overlay = document.createElement("div");
    overlay.id = "proalert-overlay";
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,.5);
      display:flex;align-items:center;justify-content:center;
      z-index:2147483647;padding:20px;box-sizing:border-box;
    `;

    const box = document.createElement("div");
    box.style.cssText = `
      background:${design.modalBgColor};border-radius:12px;
      padding:28px 24px;max-width:460px;width:100%;
      box-shadow:0 8px 32px rgba(0,0,0,.2);
    `;

    const content = document.createElement("div");
    content.innerHTML = warning.content;
    content.style.cssText = "font-size:14px;line-height:1.6;color:#202223;";
    box.appendChild(content);

    const cleanup = () => overlay.remove();
    renderButtons(design, warning, resolve, box, cleanup);

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // Close on overlay click if allowCheckout is true
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay && warning.allowCheckout) { cleanup(); resolve(false); }
    });
  }

  function showEmbedded(warning, design, btn, resolve) {
    // Remove existing embedded if present
    document.getElementById("proalert-embedded")?.remove();

    const container = document.createElement("div");
    container.id = "proalert-embedded";
    container.style.cssText = `
      background:${design.modalBgColor};border:1px solid #e1e3e5;
      border-radius:8px;padding:16px;margin:12px 0;
    `;

    const content = document.createElement("div");
    content.innerHTML = warning.content;
    content.style.cssText = "font-size:14px;line-height:1.6;color:#202223;";
    container.appendChild(content);

    const cleanup = () => container.remove();
    renderButtons(design, warning, resolve, container, cleanup);

    // Insert right before the button
    btn.parentNode?.insertBefore(container, btn);
  }

  /* ─── LINE ITEM PROPERTY ─── */
  function injectLineItemProperty(btn, text) {
    if (!text) return;
    const form = btn.closest('form[action*="/cart/add"]');
    if (!form) return;
    const existing = form.querySelector('[name="properties[_proalert]"]');
    if (existing) return;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "properties[_proalert]";
    input.value = text;
    form.appendChild(input);
  }

  /* ─── PROCEED WITH ORIGINAL ACTION ─── */
  function proceedWithOriginalAction(btn, isBuyNow) {
    // Re-trigger the click without the ProAlert handler
    btn.__proalert_bound = false;
    btn.click();
    btn.__proalert_bound = true;
  }

  /* ─── MUTATION OBSERVER (quick-add, feeds) ─── */
  function startObserver() {
    observer = new MutationObserver(() => bindButtons());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /* ─── STYLES ─── */
  function injectStyles(customCSS) {
    const style = document.createElement("style");
    style.id = "proalert-styles";
    style.textContent = `
      #proalert-overlay * { box-sizing:border-box; }
      #proalert-embedded * { box-sizing:border-box; }
      ${customCSS}
    `;
    document.head.appendChild(style);
  }

  /* ─── START ─── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
