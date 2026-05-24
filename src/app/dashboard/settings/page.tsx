"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/context/SettingsContext";

export default function SettingsPage() {
  const { settings, refreshSettings, loading: contextLoading } = useSettings();
  
  const [loading, setLoading] = useState(false);
  const [shopName, setShopName] = useState("");
  const [address, setAddress] = useState("");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [phone3, setPhone3] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [fssaiNumber, setFssaiNumber] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (settings) {
      setShopName(settings.shopName || "");
      setAddress(settings.address || "");
      setPhone1(settings.phone1 || "");
      setPhone2(settings.phone2 || "");
      setPhone3(settings.phone3 || "");
      setGstNumber(settings.gstNumber || "");
      setFssaiNumber(settings.fssaiNumber || "");
      setLogoUrl(settings.logoUrl || "");
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalLogoUrl = logoUrl;

      // Handle file upload if a new file is selected
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalLogoUrl = uploadData.url;
          setLogoUrl(finalLogoUrl);
        } else {
          alert("Failed to upload logo");
          setLoading(false);
          return;
        }
      }

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName,
          logoUrl: finalLogoUrl,
          address,
          phone1,
          phone2,
          phone3,
          gstNumber,
          fssaiNumber,
        }),
      });

      if (res.ok) {
        alert("Settings saved successfully!");
        await refreshSettings();
      } else {
        alert("Failed to save settings.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  if (contextLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Shop Profile & Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Section */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Shop Logo</label>
            <div className="flex items-center space-x-6">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo Preview" className="h-24 w-auto object-contain border rounded p-1" />
              ) : (
                <div className="h-24 w-24 bg-gray-100 flex items-center justify-center border rounded text-gray-400 text-sm">
                  No Logo
                </div>
              )}
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Recommended size: For invoices, logo will be sized to ~3 inches wide.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
            <input
              type="text"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">FSSAI Number</label>
            <input
              type="text"
              value={fssaiNumber}
              onChange={(e) => setFssaiNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number 1</label>
            <input
              type="text"
              value={phone1}
              onChange={(e) => setPhone1(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number 2 (Optional)</label>
            <input
              type="text"
              value={phone2}
              onChange={(e) => setPhone2(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number 3 (Optional)</label>
            <input
              type="text"
              value={phone3}
              onChange={(e) => setPhone3(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
