import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { redirect, useLoaderData, useNavigate } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { Page, Layout, Banner } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getWarning, updateWarning } from "../lib/warnings.server";
import { getCurrentPlan } from "../lib/billing.server";
import WarningWizard from "../components/WarningWizard";
import type { WizardData } from "../components/WarningWizard";
import i18n from "../i18n";
import { useState } from "react";
import type { TargetType } from "@prisma/client";
import type { DesignConfig } from "../lib/types";
import { DEFAULT_DESIGN } from "../lib/types";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const warning = await getWarning(params.id!, session.shop);
  if (!warning) throw new Response("Not Found", { status: 404 });
  const plan = await getCurrentPlan(session.shop, admin);
  return { warning, plan };
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const body = JSON.parse(formData.get("data") as string) as WizardData;

  await updateWarning(params.id!, session.shop, {
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
    targets: [
      { targetType: body.targetType as TargetType, targetIds: body.targetIds.map((x) => x.id) },
    ],
  });

  return redirect("/app/warnings");
};

export default function EditWarning() {
  const { warning, plan } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const target = warning.targets[0];
  const initialData: Partial<WizardData> = {
    name: warning.name,
    allowCheckout: warning.allowCheckout,
    renderType: warning.renderType,
    content: warning.content,
    specialLineItemText: warning.specialLineItemText ?? "",
    scheduleStart: warning.scheduleStart
      ? new Date(warning.scheduleStart).toISOString().slice(0, 16)
      : "",
    scheduleEnd: warning.scheduleEnd
      ? new Date(warning.scheduleEnd).toISOString().slice(0, 16)
      : "",
    visibilityOnAddToCart: warning.visibilityOnAddToCart,
    visibilityOnBuyNow: warning.visibilityOnBuyNow,
    isActive: warning.isActive,
    targetType: (target?.targetType ?? "ALL") as WizardData["targetType"],
    targetIds: (target?.targetIds ?? []).map((id) => ({ id, title: id })),
    design: (warning.designOverride as DesignConfig) ?? DEFAULT_DESIGN,
  };

  const handleSubmit = (data: WizardData) => {
    setSubmitting(true);
    const form = document.createElement("form");
    form.method = "post";
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "data";
    input.value = JSON.stringify(data);
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <Page
      title={i18n.warningForm.tituloEditar}
      backAction={{ content: i18n.warnings.titulo, url: "/app/warnings" }}
      secondaryActions={[
        { content: i18n.warningForm.cancelar, url: "/app/warnings" },
      ]}
    >
      <WarningWizard
        initialData={initialData}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        planName={plan}
      />
    </Page>
  );
}

export const headers: HeadersFunction = (headersArgs) =>
  boundary.headers(headersArgs);
