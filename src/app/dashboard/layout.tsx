import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { SettingsProvider } from "@/context/SettingsContext";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SettingsProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          userRole={session.user.role || "STAFF"}
          userName={session.user.name || "User"}
        />
        <main className="flex-1 ml-64 min-h-screen">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SettingsProvider>
  );
}
