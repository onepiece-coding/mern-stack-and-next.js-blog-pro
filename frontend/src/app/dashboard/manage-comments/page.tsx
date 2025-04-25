import { dataFetching } from "@/lib/api/admin.calls";
import { Alert, Table, TableHead, TableHeadCell } from "flowbite-react";
import { TComment } from "@/types";
import { getAuthToken } from "@/lib/api/authToken.cookie";
import { CommentsList } from "@/components/dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Manage Comments",
  description: "Admin Dashboard | Manage Comments",
  openGraph: {
    title: "Admin Dashboard | Manage Comments",
    description: "Admin Dashboard | Manage Comments",
  },
};

const ManageCommentsPage = async () => {
  // await new Promise((resolver) => setTimeout(resolver, 10000));

  const token = await getAuthToken();

  const comments = await dataFetching<TComment[]>("/api/comments", token);

  return (
    <section className="py-4 px-2 sm:px-4">
      <h2 id="manage-comments-heading" className="sr-only">
        Manage Comments
      </h2>
      {comments.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableHeadCell className="whitespace-nowrap">Count</TableHeadCell>
              <TableHeadCell className="whitespace-nowrap">User</TableHeadCell>
              <TableHeadCell className="whitespace-nowrap">
                Comment
              </TableHeadCell>
              <TableHeadCell className="whitespace-nowrap">
                Action
              </TableHeadCell>
            </TableHead>
            <CommentsList commentsList={comments} token={token} />
          </Table>
        </div>
      ) : (
        <div className="flex justify-center">
          <Alert color="info" className="max-w-fit font-semibold">
            No Comments To Show!
          </Alert>
        </div>
      )}
    </section>
  );
};

export default ManageCommentsPage;
