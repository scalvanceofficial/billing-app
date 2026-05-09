"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createProduct } from "@/actions/products";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  nameHindi: z.string().min(1, "हिंदी नाव आवश्यक आहे"),
  nameEnglish: z.string().optional(),
  unit: z.enum(["KG", "GM", "PACK"]),
  price: z.string().min(1, "किंमत आवश्यक आहे"),
  proof: z.string().optional(),
  description: z.string().optional(),
});

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { 
      unit: "KG",
      nameHindi: "",
      price: "",
      nameEnglish: "",
      proof: "",
      description: ""
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setLoading(true);
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => v !== undefined && fd.append(k, String(v)));
    const result = await createProduct(fd);
    setLoading(false);
    if (result?.error) {
      setError("काहीतरी चुकले, पुन्हा प्रयत्न करा.");
    } else {
      router.push("/dashboard/products");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/products" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 hindi-text">नवीन उत्पादन</h1>
          <p className="text-gray-500 text-sm">Add New Product</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block font-semibold text-gray-700 mb-2 hindi-text">
              उत्पादनाचे हिंदी नाव *
            </label>
            <input
              {...register("nameHindi")}
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 hindi-text"
              placeholder="जसे: हळद पावडर"
            />
            {errors.nameHindi && <p className="text-red-500 text-sm mt-1">{errors.nameHindi.message}</p>}
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-2">English Name (Optional)</label>
            <input
              {...register("nameEnglish")}
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
              placeholder="e.g. Turmeric Powder"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-2 hindi-text">युनिट *</label>
              <select
                {...register("unit")}
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-white"
              >
                <option value="KG">KG (किलोग्राम)</option>
                <option value="GM">GM (ग्रॅम)</option>
                <option value="PACK">PACK (पॅक)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-2 hindi-text">किंमत (₹/युनिट) *</label>
              <input
                {...register("price")}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 amount-text"
                placeholder="0.00"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-2 hindi-text">प्रमाण (Proof)</label>
            <input
              {...register("proof")}
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 hindi-text"
              placeholder="जसे: ५०० ग्राम"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-2">Description (Optional)</label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 resize-none"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/dashboard/products"
              className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-center hover:bg-gray-50 transition-colors hindi-text"
            >
              रद्द करा
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white rounded-xl font-bold transition-colors hindi-text"
            >
              {loading ? "जतन होत आहे..." : "✓ जतन करा"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
