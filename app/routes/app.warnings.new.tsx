import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { redirect, useActionData, useLoaderData, useNavigate } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { createWarning } from "../lib/warnings.server";
import { canCreateWarning } from "../lib/billing.server";
import WarningWizard from "../components/WarningWizard";
import type { WizardData } from "../components/WarningWizard";
import i18n from "../i18n";
import { useState } from "react";
import type { TargetType } from "@prisma/client";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const { allowed, plan } = await canCreateWarning(session.shop, admin);
  return { allowed, plan };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const { allowed } = await canCreateWarning(session.shop, admin);
  if (!allowed) return { error: i18n.errores.limitePlan };

  const formData = await request.formData();
  const body = JSON.parse(formData.get("data") as string) as WizardData;

  await createWarning(session.shop, {
    name: body.name,
    allowCheckout: body.allowCheckout,
    renderType: body.renderType,
    content: body.content,
    specialLineItemText: body.specialLineItemText || undefined,
    designOverride: body.design as object,
    scheduleStart: body.scheduleStart ? new Date(body.scheduleStart) : null,
    scheduleEnd: body.scheduleEnd ? new Date(body.scheduleEnd) : null,
    visibilityOnAddToCart: body.visibilityOnAddToCart,
    visibilityOnBuyNow: body.visibilityOnBuyNow,
    isActive: body.isActive,
    targets: [{ targetType: body.targetType as TargetType, targetIds: body.targetIds.map((x) => x.id) }],
  });

  return redirect("/app/warnings");
};

export default function NewWarning() {
  const { allowed, plan } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  if (!allowed) {
    return (
      <s-page heading={i18n.warningForm.tituloNuevo}>
        <s-section>
          <s-banner tone="warning">
            <p slot="title">{i18n.billing.upgradeModalTitulo}</p>
            <p>{i18n.billing.upgradeModalDesc}</p>
            <s-button onClick={() => navigate("/app/billing")} variant="primary">{i18n.billing.upgradeModalBtn}</s-button>
          </s-banner>
        </s-section>
      </s-page>
    );
  }

  const handleSubmit = async (data: WizardData) => {
    setSubmitting(true);
    const fd = new FormData();
    fd.append("data", JSON.stringify(data));
    const form = document.createElement("form");
    form.method = "post";
    document.body.appendChild(form);
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "data";
    input.value = JSON.stringify(data);
    form.appendChild(input);
    form.submit();
  };

  return (
    <s-page heading={i18n.warningForm.tituloNuevo}>
      <s-button slot="primary-action" onClick={() => navigate("/app/warnings")}>{i18n.warningForm.cancelar}</s-button>
      <s-section>
        {actionData && "error" in actionData && actionData.error && (
          <s-banner tone="critical"><p>{actionData.error}</p></s-banner>
        )}
        <WarningWizard onSubmit={handleSubmit} isSubmitting={submitting} planName={plan} />
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
