import React from 'react';
import { Unit } from '@prisma/client';
import { Leaf } from 'lucide-react';

interface InvoiceHTMLProps {
  invoice: any;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
}

export const InvoiceHTML = ({ invoice, shopName, shopAddress, shopPhone }: InvoiceHTMLProps) => {
  const dateStr = new Date(invoice.createdAt).toLocaleDateString("en-IN", { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });

  return (
    <div className="bg-white p-8 shadow-sm border rounded-xl max-w-4xl mx-auto print:shadow-none print:border-none print:p-0" id="invoice-content">
      {/* Header */}
      <div className="flex justify-between items-start bg-green-700 p-6 rounded-lg text-white mb-6 print:bg-green-700 print:text-white print:-mx-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-yellow-400 hindi-text">{shopName}</h1>
          <p className="text-sm opacity-90">{shopAddress}</p>
          <p className="text-sm opacity-90">संपर्क: {shopPhone}</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold uppercase tracking-wider">Invoice / बिल</h2>
          <p className="text-sm opacity-90 mt-2">Bill No: {invoice.invoiceNo}</p>
          <p className="text-sm opacity-90">Date: {dateStr}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-green-50 border-l-4 border-green-600 p-4 mb-6 rounded-r-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-green-700 font-bold uppercase hindi-text">ग्राहकचे नाव (Customer Name):</p>
            <p className="text-lg font-semibold text-gray-800">{invoice.customerName}</p>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {invoice.phone && (
              <p className="text-sm text-gray-700"><span className="font-bold text-green-700 hindi-text">मोबाईल:</span> {invoice.phone}</p>
            )}
            {invoice.address && (
              <p className="text-sm text-gray-700"><span className="font-bold text-green-700 hindi-text">पत्ता:</span> {invoice.address}</p>
            )}
            {invoice.gstin && (
              <p className="text-sm text-gray-700"><span className="font-bold text-green-700 hindi-text">GSTIN:</span> {invoice.gstin}</p>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8 outline outline-1 outline-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-green-700 text-white text-sm">
            <tr>
              <th className="py-3 px-4 w-12 text-center">अ.क्र</th>
              <th className="py-3 px-4">तपशील (Particulars)</th>
              <th className="py-3 px-4 text-center">प्रमाण</th>
              <th className="py-3 px-4 text-right">दर (₹)</th>
              <th className="py-3 px-4 text-right">रक्कम (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoice.items.map((item: any, i: number) => (
              <tr key={item.id} className="text-gray-800">
                <td className="py-3 px-4 text-center text-sm">{i + 1}</td>
                <td className="py-3 px-4 font-medium">
                  <div>{item.nameHindi}</div>
                </td>
                <td className="py-3 px-4 text-center text-sm">{item.proof || item.quantity} {item.unit}</td>
                <td className="py-3 px-4 text-right text-sm">{item.rate.toFixed(2)}</td>
                <td className="py-3 px-4 text-right font-semibold">{item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-gray-600 text-sm px-2">
            <span>Subtotal</span>
            <span>{invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.gstRate > 0 && (
            <div className="flex justify-between text-gray-600 text-sm px-2">
              <span>GST ({invoice.gstRate}%)</span>
              <span>{invoice.gstAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between bg-green-50 border-t-2 border-green-600 p-3 rounded-b-lg font-bold text-green-800 text-lg shadow-inner">
            <span>Grand Total</span>
            <span>₹ {invoice.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-8 border-t border-gray-100 mt-12">
        <p className="text-green-700 font-bold text-lg mb-1 hindi-text italic">धन्यवाद ! पुन्हा भेट द्या !</p>
        <p className="text-gray-400 text-xs uppercase tracking-widest italic">Thank You • Visit Again</p>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-content, #invoice-content * {
            visibility: visible;
          }
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
