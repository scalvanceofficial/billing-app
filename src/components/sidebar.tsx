"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Tag,
  FileText,
  BarChart2,
  Users,
  LogOut,
  Leaf,
  ChevronRight,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/context/SettingsContext";

const navItems = [
  {
    href: "/dashboard",
    label: "डॅशबोर्ड",
    sublabel: "Dashboard",
    icon: LayoutDashboard,
    adminOnly: false,
  },
  {
    href: "/dashboard/invoices/new",
    label: "+ नया बिल",
    sublabel: "New Invoice",
    icon: FileText,
    adminOnly: false,
    highlight: true,
  },
  {
    href: "/dashboard/invoices",
    label: "बिल यादी",
    sublabel: "Invoices",
    icon: FileText,
    adminOnly: false,
  },
  {
    href: "/dashboard/products",
    label: "उत्पादने",
    sublabel: "Products",
    icon: Package,
    adminOnly: false,
  },
  {
    href: "/dashboard/categories",
    label: "श्रेणी",
    sublabel: "Categories",
    icon: Tag,
    adminOnly: false,
  },
  {
    href: "/dashboard/reports",
    label: "अहवाल",
    sublabel: "Reports",
    icon: BarChart2,
    adminOnly: false,
  },
  {
    href: "/dashboard/users",
    label: "वापरकर्ते",
    sublabel: "Users",
    icon: Users,
    adminOnly: true,
  },
  {
    href: "/dashboard/settings",
    label: "सेटिंग्ज",
    sublabel: "Settings",
    icon: Settings,
    adminOnly: true,
  },
];

interface SidebarProps {
  userRole: string;
  userName: string;
}

export default function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = userRole === "ADMIN";
  const { settings } = useSettings();

  const filteredNav = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-green-800 flex flex-col shadow-2xl z-50">
      {/* Logo */}
      <div className="p-5 border-b border-green-700">
        <div className="flex items-center gap-3">
          {settings?.logoUrl ? (
            <div className="w-12 h-12 bg-white rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
              <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
            </div>
          ) : (
            <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <Leaf className="w-7 h-7 text-green-800" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-white font-bold text-base leading-tight hindi-text truncate">
              {settings?.shopName || process.env.NEXT_PUBLIC_SHOP_NAME || "श्री मसाला भांडार"}
            </h1>
            <p className="text-green-300 text-xs mt-0.5">Masala Billing</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredNav.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-green-900 font-bold transition-colors mb-3 shadow-md"
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div>
                  <div className="text-sm leading-tight hindi-text">{item.label}</div>
                  <div className="text-xs opacity-70">{item.sublabel}</div>
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                isActive
                  ? "bg-green-700 text-white shadow-md"
                  : "text-green-100 hover:bg-green-700 hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-yellow-300" : "text-green-300 group-hover:text-yellow-300"
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold leading-tight hindi-text">{item.label}</div>
                <div className="text-xs opacity-60">{item.sublabel}</div>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-yellow-300 flex-shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-3 border-t border-green-700">
        <div className="px-4 py-2 mb-2">
          <p className="text-white font-semibold text-sm truncate">{userName}</p>
          <p className="text-green-300 text-xs">
            {isAdmin ? "👑 Admin" : "👤 Staff"}
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-green-100 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium hindi-text">बाहेर पडा</span>
        </button>
      </div>
    </aside>
  );
}
