"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import { bulkImportProducts } from "@/actions/products";

export default function ImportProductsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    const buffer = await file.arrayBuffer();
    const res = await bulkImportProducts(buffer);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/products" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 hindi-text">Excel आयात</h1>
          <p className="text-gray-500 text-sm">Bulk Import Products from Excel / CSV</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        {/* Instructions */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h3 className="font-bold text-green-800 mb-2">📋 Excel Format:</h3>
          <p className="text-sm text-green-700 mb-2">Your Excel file should have these columns:</p>
          <div className="font-mono text-xs bg-white rounded-lg p-3 border border-green-200">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-1 pr-4">nameHindi</th>
                  <th className="py-1 pr-4">nameEnglish</th>
                  <th className="py-1 pr-4">unit</th>
                  <th className="py-1 pr-4">price</th>
                  <th className="py-1">proof</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-1 pr-4 hindi-text">हळद पावडर</td>
                  <td className="py-1 pr-4">Turmeric Powder</td>
                  <td className="py-1 pr-4">KG</td>
                  <td className="py-1 pr-4">150</td>
                  <td className="py-1 hindi-text">५०० ग्राम</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block font-semibold text-gray-700 mb-3 hindi-text">Excel / CSV फाइल निवडा</label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 transition-colors"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e: any) => setFile(e.target.files?.[0] || null)}
            />
            <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            {file ? (
              <div>
                <p className="font-semibold text-green-700">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 font-medium">फाइल येथे drag करा किंवा click करा</p>
                <p className="text-sm text-gray-400 mt-1">.xlsx, .xls, .csv</p>
              </div>
            )}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-xl p-4 ${result.errors.length === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.errors.length === 0 ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
              <p className="font-bold hindi-text">{result.imported} उत्पादने यशस्वीरित्या आयात केली</p>
            </div>
            {result.errors.length > 0 && (
              <p className="text-sm text-yellow-700">{result.errors.length} rows मध्ये error: {result.errors.slice(0,2).join(', ')}</p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Link href="/dashboard/products" className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-center hover:bg-gray-50 hindi-text">
            रद्द करा
          </Link>
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="flex-1 py-3 bg-green-700 hover:bg-green-800 disabled:bg-green-300 text-white rounded-xl font-bold flex items-center justify-center gap-2 hindi-text"
          >
            {loading ? "आयात होत आहे..." : (<><Upload className="w-4 h-4" />आयात करा</>)}
          </button>
        </div>
      </div>
    </div>
  );
}
