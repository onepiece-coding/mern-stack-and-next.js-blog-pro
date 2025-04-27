"use client";

import { useDashboardContext } from "@/contexts/DashboardContextProvider";
import { TPost } from "@/types";
import { TableCell, TableRow } from "flowbite-react";
import Link from "next/link";
import { memo, useMemo } from "react";

interface PostItemProps {
  post: TPost;
  index: number;
  token: string;
  pageNumber: number;
}

const PostItem = memo(
  ({ post, index, token, pageNumber: currentPage }: PostItemProps) => {
    const { setDashboardState } = useDashboardContext();

    const id = useMemo(
      () =>
        4 * (currentPage - 1) + (index + 1) < 10
          ? `0${4 * (currentPage - 1) + (index + 1)}`
          : 4 * (currentPage - 1) + (index + 1),
      [currentPage, index]
    );

    return (
      <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
        <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
          {id}
        </TableCell>
        <TableCell className="whitespace-nowrap">
          {post?.user.username}
        </TableCell>
        <TableCell className="whitespace-nowrap">{post?.title}</TableCell>
        <TableCell className="whitespace-nowrap">
          <Link
            href={`/posts/${post?._id}`}
            className="font-medium text-cyan-600 hover:underline dark:text-cyan-500 me-4"
          >
            View Post
          </Link>
          <button
            className="font-medium text-red-600 hover:underline dark:text-red-500"
            onClick={() =>
              setDashboardState({
                open: true,
                url: "/api/posts",
                id: post?._id,
                token,
                deletedItem: "Post",
              })
            }
          >
            Delete Post
          </button>
        </TableCell>
      </TableRow>
    );
  },
  (prev, next) => prev.post._id === next.post._id
);

PostItem.displayName = "PostItem";

export default PostItem;
