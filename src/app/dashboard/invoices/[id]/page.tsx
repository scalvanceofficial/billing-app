import { getInvoice } from "@/actions/invoices";
import { notFound } from "next/navigation";
import InvoiceViewClient from "@/components/invoice-view-client";
import { prisma } from "@/lib/prisma";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [invoice, settingsRaw] = await Promise.all([
    getInvoice(id),
    prisma.settings.findFirst(),
  ]);
  if (!invoice) notFound();

  // Serialize settings (strip Date objects) so they can be passed as a client component prop
  const initialSettings = settingsRaw
    ? {
        id: settingsRaw.id,
        shopName: settingsRaw.shopName,
        logoUrl: settingsRaw.logoUrl,
        address: settingsRaw.address,
        phone1: settingsRaw.phone1,
        phone2: settingsRaw.phone2,
        phone3: settingsRaw.phone3,
        gstNumber: settingsRaw.gstNumber,
        fssaiNumber: settingsRaw.fssaiNumber,
      }
    : null;

  return <InvoiceViewClient invoice={invoice} initialSettings={initialSettings} />;
}
