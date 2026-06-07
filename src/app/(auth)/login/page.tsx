"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Leaf } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("सही email address टाका"),
  password: z.string().min(6, "Password किमान 6 अक्षर असणे आवश्यक आहे"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shopName, setShopName] = useState(process.env.NEXT_PUBLIC_SHOP_NAME || "श्री मसाला भांडार");
  const [logoUrl, setLogoUrl] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.shopName) setShopName(data.shopName);
        if (data.logoUrl) setLogoUrl(data.logoUrl);
      })
      .catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        setError("चुकीचा email किंवा password. पुन्हा प्रयत्न करा.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("काहीतरी चुकले. पुन्हा प्रयत्न करा.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          {logoUrl ? (
            <div className="mx-auto w-24 h-24 bg-white rounded-full mb-4 shadow-lg flex items-center justify-center p-2">
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-700 rounded-full mb-4 shadow-lg">
              <Leaf className="w-10 h-10 text-yellow-300" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-green-800 hindi-text">
            {shopName}
          </h1>
          <p className="text-green-600 mt-1 text-lg">मसाला बिलिंग सिस्टम</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center hindi-text">
            लॉगिन करा
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="admin@masala.com"
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white text-xl font-bold rounded-xl transition-colors shadow-md mt-2"
            >
              {loading ? "लॉगिन होत आहे..." : "🔑 लॉगिन करा"}
            </button>
          </form>

          {/* <p className="text-center text-sm text-gray-400 mt-6">
            Default: admin@masala.com / Admin@123
          </p> */}
        </div>
      </div>
    </div>
  );
}
