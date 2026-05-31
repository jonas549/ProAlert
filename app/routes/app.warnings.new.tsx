import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { redirect, useLoaderData, useNavigate } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { Page, Layout, Card, Banner, Button } from "@shopify/polaris";
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
    targets: [
      { targetType: body.targetType as TargetType, targetIds: body.targetIds.map((x) => x.id) },
    ],
  });

  return redirect("/app/warnings");
};

export default function NewWarning() {
  const { allowed, plan } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  if (!allowed) {
    return (
      <Page
        title={i18n.warningForm.tituloNuevo}
        backAction={{ content: i18n.warnings.titulo, url: "/app/warnings" }}
      >
        <Layout>
          <Layout.Section>
            <Banner
              title={i18n.billing.upgradeModalTitulo}
              tone="warning"
              action={{ content: i18n.billing.upgradeModalBtn, onAction: () => navigate("/app/billing") }}
            >
              <p>{i18n.billing.upgradeModalDesc}</p>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

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
      title={i18n.warningForm.tituloNuevo}
      backAction={{ content: i18n.warnings.titulo, url: "/app/warnings" }}
      secondaryActions={[
        { content: i18n.warningForm.cancelar, url: "/app/warnings" },
      ]}
    >
      <WarningWizard
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        planName={plan}
      />
    </Page>
  );
}

export const headers: HeadersFunction = (headersArgs) =>
  boundary.headers(headersArgs);
