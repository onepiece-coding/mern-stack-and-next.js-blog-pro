import { dataFetching } from "@/lib/api/admin.calls";
import { Alert, Table, TableHead, TableHeadCell } from "flowbite-react";
import { PostsList } from "@/components/dashboard";
import { TPost } from "@/types";
import { getAuthToken } from "@/lib/api/authToken.cookie";
import { Pagination } from "@/components/posts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Manage Posts",
  description: "Admin Dashboard | Manage Posts",
  openGraph: {
    title: "Admin Dashboard | Manage Posts",
    description: "Admin Dashboard | Manage Posts",
  },
};

const ManagePostsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ pageNumber: string }>;
}) => {
  // await new Promise((resolver) => setTimeout(resolver, 10000));

  const { pageNumber = "1" } = await searchParams;

  const [data, token] = await Promise.all([
    dataFetching<{ posts: TPost[]; totalPages: number }>(
      `/api/posts?pageNumber=${pageNumber}`
    ),
    getAuthToken(),
  ]);

  return (
    <section className="py-4 px-2 sm:px-4">
      <h2 id="manage-posts-heading" className="sr-only">
        Manage Posts
      </h2>
      {data.posts.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableHeadCell className="whitespace-nowrap">Count</TableHeadCell>
              <TableHeadCell className="whitespace-nowrap">User</TableHeadCell>
              <TableHeadCell className="whitespace-nowrap">
                Post Title
              </TableHeadCell>
              <TableHeadCell className="whitespace-nowrap">
                Actions
              </TableHeadCell>
            </TableHead>
            <PostsList
              postsList={data.posts}
              token={token}
              pageNumber={+pageNumber}
            />
          </Table>
        </div>
      ) : (
        <div className="flex justify-center">
          <Alert color="info" className="max-w-fit font-semibold">
            No Posts To Show!
          </Alert>
        </div>
      )}
      {data.totalPages > 1 && <Pagination totalPages={data.totalPages} />}
    </section>
  );
};

export default ManagePostsPage;
