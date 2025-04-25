import { dataFetching } from "@/lib/api/admin.calls";
import { Alert, Table, TableHead, TableHeadCell } from "flowbite-react";
import { TCategory } from "@/types";
import { getAuthToken } from "@/lib/api/authToken.cookie";
import { CategoriesList } from "@/components/dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Manage Categories",
  description: "Admin Dashboard | Manage Categories",
  openGraph: {
    title: "Admin Dashboard | Manage Categories",
    description: "Admin Dashboard | Manage Categories",
  },
};

const ManageCategoriesPage = async () => {
  // await new Promise((resolver) => setTimeout(resolver, 10000));

  const [categories, token] = await Promise.all([
    dataFetching<TCategory[]>("/api/categories"),
    getAuthToken(),
  ]);

  return (
    <section className="py-4 px-2 sm:px-4">
      <h2 id="manage-categories-heading" className="sr-only">
        Manage Categories
      </h2>
      {categories.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableHeadCell className="whitespace-nowrap">Count</TableHeadCell>
              <TableHeadCell className="whitespace-nowrap">
                Category Title
              </TableHeadCell>
              <TableHeadCell className="whitespace-nowrap">
                Action
              </TableHeadCell>
            </TableHead>
            <CategoriesList categoriesList={categories} token={token} />
          </Table>
        </div>
      ) : (
        <div className="flex justify-center">
          <Alert color="info" className="max-w-fit font-semibold">
            No Categories To Show!
          </Alert>
        </div>
      )}
    </section>
  );
};

export default ManageCategoriesPage;
