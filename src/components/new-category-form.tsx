"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createCategory, bulkImportCategoryProducts } from "@/actions/categories";
import Link from "next/link";
import { ArrowLeft, Search, X, Upload, FileSpreadsheet, Trash2 } from "lucide-react";
import { Unit } from "@prisma/client";

interface Product {
  id?: string;
  productId?: string;
  nameHindi: string;
  nameEnglish: string | null;
  unit: Unit;
  price: number;
  proof?: string;
}

export default function NewCategoryPage({ allProducts }: { allProducts: any[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const filtered = allProducts.filter(
    (p) =>
      !selected.find((s) => s.productId === p.id || s.id === p.id) &&
      (p.nameHindi.includes(search) || (p.nameEnglish || "").toLowerCase().includes(search.toLowerCase()))
  );

  const addProduct = (p: any) => {
    setSelected((prev) => [...prev, {
      productId: p.id,
      nameHindi: p.nameHindi,
      nameEnglish: p.nameEnglish,
      unit: p.unit as Unit,
      price: p.price,
      proof: p.proof || ""
    }]);
    setSearch("");
  };

  const removeProduct = (idx: number) => setSelected((prev) => prev.filter((_, i) => i !== idx));

  const updateProductField = (idx: number, field: keyof Product, value: any) => {
    setSelected((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      const imported = await bulkImportCategoryProducts(buffer);
      // Append imported products to selected, avoiding duplicates by productId
      setSelected((prev) => {
        const newSelected = [...prev];
        imported.forEach((ip: any) => {
          if (!newSelected.find(s => s.productId === ip.productId)) {
            newSelected.push(ip);
          }
        });
        return newSelected;
      });
    } catch (err) {
      alert("Error importing file");
      console.error(err);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) return alert("श्रेणीचे नाव टाका");
    setLoading(true);
    const fd = new FormData();
    fd.append("name", name);
    fd.append("productsData", JSON.stringify(selected));
    
    const res = await createCategory(fd);
    if ('error' in res) {
      alert(res.error);
      setLoading(false);
    } else {
      router.push("/dashboard/categories");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/categories" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 hindi-text">नवीन श्रेणी</h1>
            <p className="text-gray-500 text-sm">Create Category & Add Products</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-semibold transition-colors border border-blue-200"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hindi-text">{importing ? "आयात होत आहे..." : "Excel वरून आयात करा"}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div>
          <label className="block font-semibold text-gray-700 mb-2 hindi-text">श्रेणीचे नाव * (Hindi)</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 hindi-text"
            placeholder="जसे: चटणी मसाला"
          />
        </div>

        {/* Selected products table */}
        <div>
          <label className="block font-semibold text-gray-700 mb-3 hindi-text">निवडलेली उत्पादने ({selected.length})</label>
          <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-sm font-bold text-gray-600 hindi-text">उत्पादन नाव</th>
                  <th className="px-4 py-3 text-sm font-bold text-gray-600 hindi-text">युनिट</th>
                  <th className="px-4 py-3 text-sm font-bold text-gray-600 hindi-text">प्रमाण (Proof)</th>
                  <th className="px-4 py-3 text-sm font-bold text-gray-600 hindi-text">किंमत (Rate)</th>
                  <th className="px-4 py-3 text-sm font-bold text-gray-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {selected.map((p, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 hindi-text">{p.nameHindi}</div>
                      <div className="text-xs text-gray-400">{p.nameEnglish}</div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={p.unit}
                        onChange={(e) => updateProductField(idx, "unit", e.target.value)}
                        className="bg-transparent border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-green-500"
                      >
                        {Object.values(Unit).map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={p.proof || ""}
                        onChange={(e) => updateProductField(idx, "proof", e.target.value)}
                        className="w-full bg-transparent border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-green-500 hindi-text"
                        placeholder="प्रमाण"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400 text-sm">₹</span>
                        <input
                          type="number"
                          value={p.price}
                          onChange={(e) => updateProductField(idx, "price", parseFloat(e.target.value) || 0)}
                          className="w-20 bg-transparent border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-green-500"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => removeProduct(idx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {selected.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400 hindi-text italic">
                      कोणतेही उत्पादन निवडलेले नाही. शोधून किंवा Excel वरून जोडा.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product search & add */}
        <div className="pt-4 border-t border-gray-50">
          <label className="block font-semibold text-gray-700 mb-2 hindi-text">उत्पादने शोधा आणि जोडा</label>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 hindi-text"
              placeholder="उत्पादन नाव टाइप करा..."
            />
          </div>
          {search.length > 0 && (
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl divide-y shadow-sm">
              {filtered.slice(0, 20).map((p) => (
                <button
                  key={p.id}
                  onClick={() => addProduct(p)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-green-50 text-left transition-colors group"
                >
                  <div>
                    <div className="hindi-text font-medium text-gray-800 group-hover:text-green-700">{p.nameHindi}</div>
                    <div className="text-xs text-gray-400">{p.nameEnglish}</div>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">₹{p.price}/{p.unit}</span>
                </button>
              ))}
              {filtered.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">उत्पादन सापडले नाही</p>}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-6 border-t border-gray-50">
          <Link href="/dashboard/categories" className="flex-1 py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl font-bold text-center hover:bg-gray-50 transition-colors hindi-text">रद्द करा</Link>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3.5 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-green-200/50 hindi-text">
            {loading ? "जतन होत आहे..." : "✓ श्रेणी जतन करा"}
          </button>
        </div>
      </div>
    </div>
  );
}
