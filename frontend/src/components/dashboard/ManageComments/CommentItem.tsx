"use client";

import { useDashboardContext } from "@/contexts/DashboardContextProvider";
import { TComment } from "@/types";
import { TableCell, TableRow } from "flowbite-react";
import { memo } from "react";

interface CommentItemProps {
  comment: TComment;
  index: number;
  token: string;
}

const CommentItem = memo(
  ({ comment, index, token }: CommentItemProps) => {
    const { setDashboardState } = useDashboardContext();

    return (
      <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
        <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
          {index < 9 ? `0${index + 1}` : index + 1}
        </TableCell>
        <TableCell className="whitespace-nowrap">{comment?.username}</TableCell>
        <TableCell className="whitespace-nowrap">{comment?.text}</TableCell>
        <TableCell className="whitespace-nowrap">
          <button
            className="font-medium text-red-600 hover:underline dark:text-red-500"
            onClick={() =>
              setDashboardState({
                open: true,
                url: "/api/comments",
                id: comment?._id,
                token,
                deletedItem: "Comment",
              })
            }
          >
            Delete Comment
          </button>
        </TableCell>
      </TableRow>
    );
  },
  (prev, next) => prev.comment._id === next.comment._id
);

CommentItem.displayName = "CommentItem";

export default CommentItem;
