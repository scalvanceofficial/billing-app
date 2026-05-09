"use client";

import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { InvoiceDocument } from "@/components/invoice-pdf";
import { Download, ArrowLeft, Printer, Receipt } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { InvoiceHTML } from "@/components/invoice-html";
import { InvoiceThermal, generateThermalPrintHTML } from "@/components/invoice-thermal";

export default function InvoiceViewClient({ invoice }: { invoice: any }) {
  const [isClient, setIsClient] = useState(false);
  const [viewMode, setViewMode] = useState<'html' | 'pdf' | 'thermal'>('thermal');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const shopName    = process.env.NEXT_PUBLIC_SHOP_NAME    || "श्री मसाला भांडार";
  const shopAddress = process.env.NEXT_PUBLIC_SHOP_ADDRESS || "पुणे, महाराष्ट्र";
  const shopPhone   = process.env.NEXT_PUBLIC_SHOP_PHONE   || "+91 98765 43210";

  // ── Thermal Print: generate full HTML & open in new window ──────────────
  const handleThermalPrint = () => {
    const html = generateThermalPrintHTML(invoice, shopName, shopAddress, shopPhone);
    const win = window.open('', '_blank', 'width=420,height=700,toolbar=0,scrollbars=1');
    if (!win) {
      alert("Please allow pop-ups for this site to enable thermal printing.");
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  // ── Regular A4 print ────────────────────────────────────────────────────
  const handleA4Print = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 mb-20">

      {/* ── Action Bar ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/invoices" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 hindi-text">
            बिल क्र. {invoice.invoiceNo}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isClient && (
            <>
              {/* 🧾 Thermal Print - Primary */}
              <button
                onClick={handleThermalPrint}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 text-base"
                title="80mm thermal printer bill"
              >
                <Receipt className="w-5 h-5" />
                <span className="hindi-text">80mm थर्मल प्रिंट</span>
              </button>

              {/* 🖨 A4 Print */}
              <button
                onClick={handleA4Print}
                className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-sm active:scale-95 text-sm"
              >
                <Printer className="w-4 h-4" />
                <span className="hindi-text">A4 प्रिंट</span>
              </button>

              {/* ⬇ PDF Download */}
              <PDFDownloadLink
                document={
                  <InvoiceDocument
                    invoice={invoice}
                    shopName={shopName}
                    shopAddress={shopAddress}
                    shopPhone={shopPhone}
                  />
                }
                fileName={`${invoice.invoiceNo}.pdf`}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold transition-all text-sm"
              >
                {({ loading }) => (loading ? "..." : <><Download className="w-4 h-4" /> PDF</>)}
              </PDFDownloadLink>

              {/* View Mode Tabs */}
              <div className="ml-1 pl-2 border-l border-gray-200 flex gap-1">
                <button
                  onClick={() => setViewMode('html')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-colors",
                    viewMode === 'html' ? "bg-green-100 text-green-700" : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                  A4
                </button>
                <button
                  onClick={() => setViewMode('thermal')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-colors",
                    viewMode === 'thermal' ? "bg-amber-100 text-amber-700" : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                  थर्मल
                </button>
                <button
                  onClick={() => setViewMode('pdf')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-colors",
                    viewMode === 'pdf' ? "bg-green-100 text-green-700" : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                  PDF
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Preview Area ────────────────────────────────────────────── */}
      {isClient && (
        <div className="w-full flex justify-center">

          {/* A4 HTML View */}
          {viewMode === 'html' && (
            <div className="w-full">
              <InvoiceHTML
                invoice={invoice}
                shopName={shopName}
                shopAddress={shopAddress}
                shopPhone={shopPhone}
              />
            </div>
          )}

          {/* Thermal Receipt Preview */}
          {viewMode === 'thermal' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 font-medium">
                🖨 यह थर्मल प्रिंट प्रिव्यू है — &quot;थर्मल प्रिंट&quot; बटण दाबल्यावर 80mm थर्मल प्रिंटर वर छापेल
              </p>

              {/* Receipt paper wrapper */}
              <div
                className="relative"
                style={{
                  filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.18))',
                }}
              >
                {/* Jagged top edge */}
                <svg width="310" height="12" viewBox="0 0 310 12" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                  <path d="M0,12 L0,6 L10,0 L20,6 L30,0 L40,6 L50,0 L60,6 L70,0 L80,6 L90,0 L100,6 L110,0 L120,6 L130,0 L140,6 L150,0 L160,6 L170,0 L180,6 L190,0 L200,6 L210,0 L220,6 L230,0 L240,6 L250,0 L260,6 L270,0 L280,6 L290,0 L300,6 L310,0 L310,12 Z" fill="white"/>
                </svg>

                {/* Receipt body */}
                <div style={{ background: '#fff', width: '310px', padding: '0 8px' }}>
                  <InvoiceThermal
                    invoice={invoice}
                    shopName={shopName}
                    shopAddress={shopAddress}
                    shopPhone={shopPhone}
                  />
                </div>

                {/* Jagged bottom edge */}
                <svg width="310" height="12" viewBox="0 0 310 12" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                  <path d="M0,0 L0,6 L10,12 L20,6 L30,12 L40,6 L50,12 L60,6 L70,12 L80,6 L90,12 L100,6 L110,12 L120,6 L130,12 L140,6 L150,12 L160,6 L170,12 L180,6 L190,12 L200,6 L210,12 L220,6 L230,12 L240,6 L250,12 L260,6 L270,12 L280,6 L290,12 L300,6 L310,12 L310,0 Z" fill="white"/>
                </svg>
              </div>

              <button
                onClick={handleThermalPrint}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95"
              >
                <Receipt className="w-4 h-4" />
                <span className="hindi-text">थर्मल प्रिंटर वर छापा</span>
              </button>
            </div>
          )}

          {/* PDF Preview */}
          {viewMode === 'pdf' && (
            <div className="h-[800px] w-full rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm bg-white">
              <PDFViewer width="100%" height="100%" showToolbar={true}>
                <InvoiceDocument
                  invoice={invoice}
                  shopName={shopName}
                  shopAddress={shopAddress}
                  shopPhone={shopPhone}
                />
              </PDFViewer>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
