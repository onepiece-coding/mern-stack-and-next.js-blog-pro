import { DashboardStatistics } from "@/components/dashboard";
import { AddCategoryForm } from "@/components/forms";
import { getAuthToken } from "@/lib/api/authToken.cookie";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Blog Pro",
  description: "Admin Dashboard | Statistics & Add Category Form",
  openGraph: {
    title: "Admin Dashboard | Blog Pro",
    description: "Admin Dashboard | Statistics & Add Category Form",
  },
};

const DashboardPage = async () => {
  // await new Promise((resolver) => setTimeout(resolver, 10000));

  const token = await getAuthToken();

  return (
    <>
      <DashboardStatistics token={token} />
      <div className="my-1 h-px bg-gray-100 dark:bg-gray-600"></div>
      <AddCategoryForm token={token} />
    </>
  );
};

export default DashboardPage;
