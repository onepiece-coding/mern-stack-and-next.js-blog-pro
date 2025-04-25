import { dataFetching } from "@/lib/api/admin.calls";
import { Alert, Table, TableHead, TableHeadCell } from "flowbite-react";
import { UsersList } from "@/components/dashboard";
import { TUser } from "@/types";
import { getAuthToken } from "@/lib/api/authToken.cookie";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Manage Users",
  description: "Admin Dashboard | Manage Users",
  openGraph: {
    title: "Admin Dashboard | Manage Users",
    description: "Admin Dashboard | Manage Users",
  },
};

const ManageUsersPage = async () => {
  // await new Promise((resolver) => setTimeout(resolver, 10000));

  const token = await getAuthToken();

  const users = await dataFetching<TUser[]>("/api/users/profile", token);

  return (
    <section className="py-4 px-2 sm:px-4">
      <h2 id="manage-users-heading" className="sr-only">
        Manage Users
      </h2>
      {users.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableHeadCell className="whitespace-nowrap">Count</TableHeadCell>
              <TableHeadCell className="whitespace-nowrap">User</TableHeadCell>
              <TableHeadCell className="whitespace-nowrap">Email</TableHeadCell>
              <TableHeadCell className="whitespace-nowrap">
                Actions
              </TableHeadCell>
            </TableHead>
            <UsersList usersList={users} token={token} />
          </Table>
        </div>
      ) : (
        <div className="flex justify-center">
          <Alert color="info" className="max-w-fit font-semibold">
            No Users To Show!
          </Alert>
        </div>
      )}
    </section>
  );
};

export default ManageUsersPage;
