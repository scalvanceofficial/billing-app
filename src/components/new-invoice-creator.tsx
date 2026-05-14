"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInvoice } from "@/actions/invoices";
import { Unit } from "@prisma/client";
import { ArrowLeft, Plus, Trash2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  nameHindi: string;
  nameEnglish: string | null;
  unit: Unit;
  price: number;
  proof: string | null;
}

interface CategoryProduct {
  productId: string;
  price: number | null;
  unit: Unit | null;
  proof: string | null;
  product: Product;
  order: number;
}

interface Category {
  id: string;
  name: string;
  products: CategoryProduct[];
}

interface InvoiceItem {
  productId?: string;
  nameHindi: string;
  nameEnglish?: string;
  unit: Unit;
  proof?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export default function NewInvoiceCreator({
  categories,
  allProducts,
}: {
  categories: Category[];
  allProducts: Product[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [gstin, setGstin] = useState("");
  const [gstRate, setGstRate] = useState(0);
  const [notes, setNotes] = useState("");

  // Items
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const subtotal = items.reduce((s: number, i: InvoiceItem) => s + i.amount, 0);
  const gstAmount = (subtotal * gstRate) / 100;
  const grandTotal = subtotal + gstAmount;

  const updateItem = (idx: number, field: keyof InvoiceItem, value: any) => {
    setItems((prev: InvoiceItem[]) =>
      prev.map((item: InvoiceItem, i: number) => {
        if (i !== idx) return item;
        const updated = { ...item, [field]: value };
        // If proof or rate is updated, recalculate amount
        if (field === "proof" || field === "rate") {
          const qty = parseFloat(String(updated.proof)) || 0;
          updated.quantity = qty; // Keep numeric quantity for reports if needed
          updated.amount = Number(updated.rate); // Amount is now direct Rate
        }
        return updated;
      })
    );
  };

  const removeItem = (idx: number) => setItems((prev: InvoiceItem[]) => prev.filter((_: InvoiceItem, i: number) => i !== idx));

  const addProduct = (p: Product) => {
    if (items.find((i: InvoiceItem) => i.productId === p.id)) return;
    const qty = parseFloat(p.proof || "0") || 0;
    setItems((prev: InvoiceItem[]) => [
      ...prev,
      {
        productId: p.id,
        nameHindi: p.nameHindi,
        nameEnglish: p.nameEnglish || undefined,
        unit: p.unit,
        proof: p.proof || "",
        quantity: qty,
        rate: p.price,
        amount: p.price,
      },
    ]);
    setSearchProduct("");
  };

  const loadCategory = (cat: Category) => {
    const newItems: InvoiceItem[] = cat.products
      .sort((a, b) => a.order - b.order)
      .map((cp) => {
        const proof = cp.proof || cp.product.proof || "";
        const rate = cp.price || cp.product.price;
        const qty = parseFloat(proof) || 0;
        return {
          productId: cp.product.id,
          nameHindi: cp.product.nameHindi,
          nameEnglish: cp.product.nameEnglish || undefined,
          unit: cp.unit || cp.product.unit,
          proof,
          quantity: qty,
          rate,
          amount: rate,
        };
      });
    setItems(newItems);
    setShowCategoryModal(false);
  };

  const addEmptyRow = () => {
    setItems((prev) => [
      ...prev,
      { nameHindi: "", unit: Unit.KG, proof: "", quantity: 0, rate: 0, amount: 0 },
    ]);
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) return alert("ग्राहकाचे नाव टाका");
    const validItems = items.filter((i) => i.quantity > 0 && i.nameHindi);
    if (validItems.length === 0) return alert("किमान एक वस्तू जोडा");

    setLoading(true);
    try {
      const result = await createInvoice({
        customerName,
        phone: phone || undefined,
        address: address || undefined,
        gstin: gstin || undefined,
        gstRate,
        notes: notes || undefined,
        items: validItems,
      });

      if (result?.success && result.invoice) {
        router.push(`/dashboard/invoices/${result.invoice.id}`);
      } else {
        alert(result?.error || "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Submit Error:", error);
      alert("Error: " + (error.message || "Unknown error occurred"));
      setLoading(false);
    }
  };

  const filteredProducts = allProducts.filter(
    (p) =>
      !items.find((i) => i.productId === p.id) &&
      (p.nameHindi.includes(searchProduct) ||
        (p.nameEnglish || "").toLowerCase().includes(searchProduct.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/invoices" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 hindi-text">नया बिल बनाएं</h1>
          <p className="text-gray-500 text-sm">New Invoice</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        {[1, 2].map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors text-sm ${
              step === s
                ? "bg-green-700 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">{s}</span>
            <span className="hindi-text">{s === 1 ? "ग्राहक माहिती" : "वस्तू यादी"}</span>
          </button>
        ))}
      </div>

      {/* Step 1: Customer Details */}
      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <h2 className="text-xl font-bold text-gray-800 hindi-text">ग्राहकाची माहिती</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block font-semibold text-gray-700 mb-2 hindi-text">ग्राहकाचे नाव * (Customer Name)</label>
              <input
                value={customerName}
                onChange={(e: any) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 text-xl border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 font-semibold"
                placeholder="Customer Name"
                autoFocus
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-2 hindi-text">मोबाइल नंबर</label>
              <input
                value={phone}
                onChange={(e: any) => setPhone(e.target.value)}
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                placeholder="+91 98765 43210"
                type="tel"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-2">GSTIN (Optional)</label>
              <input
                value={gstin}
                onChange={(e: any) => setGstin(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 font-mono"
                placeholder="27XXXXX..."
                maxLength={15}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-gray-700 mb-2 hindi-text">पत्ता (Address)</label>
              <textarea
                value={address}
                onChange={(e: any) => setAddress(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 resize-none"
                placeholder="Customer Address"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-2 hindi-text">GST दर</label>
              <select
                value={gstRate}
                onChange={(e: any) => setGstRate(Number(e.target.value))}
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-white"
              >
                <option value={0}>0% (No GST)</option>
                <option value={5}>5% GST</option>
                <option value={12}>12% GST</option>
                <option value={18}>18% GST</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-2 hindi-text">टीप (Notes)</label>
              <input
                value={notes}
                onChange={(e: any) => setNotes(e.target.value)}
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                placeholder="Optional notes..."
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                if (!customerName.trim()) return alert("ग्राहकाचे नाव टाका");
                setStep(2);
              }}
              className="w-full py-4 bg-green-700 hover:bg-green-800 text-white text-xl font-bold rounded-xl transition-colors hindi-text"
            >
              पुढे जा → वस्तू यादी
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Items */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Add controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Load Category */}
              <div className="relative">
                <button
                  onClick={() => setShowCategoryModal(!showCategoryModal)}
                  className="flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors hindi-text"
                >
                  <ChevronDown className="w-4 h-4" /> श्रेणी लोड करा
                </button>
                {showCategoryModal && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-10 min-w-56">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => loadCategory(cat)}
                        className="w-full text-left px-4 py-3 hover:bg-green-50 hindi-text font-medium border-b last:border-b-0 text-sm"
                      >
                        {cat.name} ({cat.products.length})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Manual search */}
              <div className="relative flex-1 min-w-48">
                <input
                  value={searchProduct}
                  onChange={(e: any) => setSearchProduct(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 hindi-text"
                  placeholder="उत्पादन शोधा आणि जोडा..."
                />
                {searchProduct && filteredProducts.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 z-10 max-h-48 overflow-y-auto">
                    {filteredProducts.slice(0, 10).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => addProduct(p)}
                        className="w-full text-left px-4 py-2.5 hover:bg-green-50 flex items-center justify-between transition-colors"
                      >
                        <span className="hindi-text font-medium text-sm">{p.nameHindi}</span>
                        <span className="text-xs text-gray-500">₹{p.price}/{p.unit}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={addEmptyRow}
                className="flex items-center gap-2 px-4 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" /> रिकामी ओळ
              </button>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-50 border-b border-green-100">
                <tr>
                  <th className="text-left py-3 px-3 text-green-800 font-bold hindi-text w-8">#</th>
                  <th className="text-left py-3 px-3 text-green-800 font-bold hindi-text">उत्पादनाचे नाव</th>
                  <th className="text-center py-3 px-3 text-green-800 font-bold w-28">युनिट</th>
                  <th className="text-center py-3 px-3 text-green-800 font-bold w-32 hindi-text">प्रमाण (Proof)</th>
                  <th className="text-right py-3 px-3 text-green-800 font-bold w-28 hindi-text">दर (₹)</th>
                  <th className="text-right py-3 px-3 text-green-800 font-bold w-32 hindi-text">रक्कम (₹)</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400 hindi-text">
                      वरून श्रेणी लोड करा किंवा उत्पादन शोधा
                    </td>
                  </tr>
                )}
                {items.map((item: InvoiceItem, idx: number) => (
                  <tr key={idx} className={`hover:bg-green-50/30 transition-colors ${item.quantity > 0 ? 'bg-green-50/20' : ''}`}>
                    <td className="py-2 px-3 text-gray-400 text-xs">{idx + 1}</td>
                    <td className="py-2 px-3">
                      {item.productId ? (
                        <span className="hindi-text font-semibold text-gray-900">{item.nameHindi}</span>
                      ) : (
                        <input
                          value={item.nameHindi}
                          onChange={(e: any) => updateItem(idx, "nameHindi", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-200 rounded-lg hindi-text text-sm focus:outline-none focus:border-green-500"
                          placeholder="नाव टाका..."
                        />
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <select
                        value={item.unit}
                        onChange={(e: any) => updateItem(idx, "unit", e.target.value)}
                        className="w-full bg-gray-100 border-none rounded-lg px-2 py-1 text-xs font-bold text-gray-600 focus:ring-2 focus:ring-green-500"
                      >
                        {Object.values(Unit).map((u: any) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        value={item.proof || ""}
                        onChange={(e: any) => updateItem(idx, "proof", e.target.value)}
                        className="w-full px-2 py-1.5 border-2 border-gray-200 rounded-lg text-center font-bold text-base focus:outline-none focus:border-green-500 focus:bg-green-50"
                        placeholder="प्रमाण"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        value={item.rate || ""}
                        onChange={(e: any) => updateItem(idx, "rate", parseFloat(e.target.value) || 0)}
                        step="0.01"
                        min="0"
                        className="w-full px-2 py-1.5 border-2 border-gray-200 rounded-lg text-right font-semibold focus:outline-none focus:border-green-500 amount-text"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-green-700 amount-text">
                      {item.amount > 0 ? formatCurrency(item.amount) : "—"}
                    </td>
                    <td className="py-2 px-3">
                      <button onClick={() => removeItem(idx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col items-end gap-2 text-sm">
              <div className="flex items-center gap-8">
                <span className="text-gray-600 hindi-text">एकूण (Subtotal)</span>
                <span className="font-bold amount-text w-36 text-right">{formatCurrency(subtotal)}</span>
              </div>
              {gstRate > 0 && (
                <div className="flex items-center gap-8">
                  <span className="text-gray-600">GST ({gstRate}%)</span>
                  <span className="font-bold amount-text w-36 text-right">{formatCurrency(gstAmount)}</span>
                </div>
              )}
              <div className="h-px bg-gray-200 w-64" />
              <div className="flex items-center gap-8">
                <span className="text-xl font-bold text-gray-800 hindi-text">एकूण रक्कम</span>
                <span className="text-2xl font-bold text-green-700 amount-text w-36 text-right">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hindi-text text-lg"
            >
              ← मागे जा
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-2 py-4 px-8 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white rounded-xl font-bold text-xl shadow-lg transition-colors hindi-text"
            >
              {loading ? "बिल बनत आहे..." : "🧾 बिल तयार करा"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
