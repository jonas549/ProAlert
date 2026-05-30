export type ButtonDesign = {
  text: string;
  fontSize: number;
  bold: boolean;
  fontColor: string;
  backgroundColor: string;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
};

export type DesignConfig = {
  showCancelButton: boolean;
  cancelButton: ButtonDesign;
  confirmButton: ButtonDesign;
  modalBgColor: string;
};

export const DEFAULT_DESIGN: DesignConfig = {
  showCancelButton: true,
  cancelButton: {
    text: "Cancelar",
    fontSize: 14,
    bold: false,
    fontColor: "#202223",
    backgroundColor: "#f6f6f7",
    borderWidth: 1,
    borderColor: "#c9cccf",
    borderRadius: 6,
  },
  confirmButton: {
    text: "Entendido",
    fontSize: 14,
    bold: false,
    fontColor: "#ffffff",
    backgroundColor: "#008060",
    borderWidth: 0,
    borderColor: "#008060",
    borderRadius: 6,
  },
  modalBgColor: "#ffffff",
};

export const DEFAULT_ADD_TO_CART_SELECTOR =
  'form[action*="/cart/add"] [type=submit], .product-form__submit, button[name="add"], .add_to_cart, [data-action="add-to-cart"], .btn-add-to-cart';

export type PlanName = "FREE" | "UNLIMITED";

export const PLAN_LIMITS: Record<PlanName, { warnings: number; products: number }> = {
  FREE: { warnings: 1, products: 10 },
  UNLIMITED: { warnings: Infinity, products: Infinity },
};
