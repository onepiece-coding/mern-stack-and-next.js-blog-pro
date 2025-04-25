import { DashboardSidebar } from "@/components/dashboard";
import { getAuthToken } from "@/lib/api/authToken.cookie";
import { getMe } from "@/lib/api/profile.calls";
import { redirect } from "next/navigation";
import DashboardContextProvider from "@/contexts/DashboardContextProvider";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getAuthToken();

  if (!token) {
    // not signed in? right away go to /login
    redirect("/login");
  }

  const { result } = await getMe(token);

  if (!result.isAdmin) {
    // signed in but not an admin? bounce to homepage
    redirect("/");
  }

  return (
    <div className="flex min-h-[calc(100vh-60px)]">
      <DashboardSidebar />
      <main className="flex-grow bg-white dark:bg-gray-900 overflow-x-hidden">
        <DashboardContextProvider>{children}</DashboardContextProvider>
      </main>
    </div>
  );
}
