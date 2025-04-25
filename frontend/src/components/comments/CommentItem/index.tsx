"use client";

import { TComment } from "@/types";
import { memo } from "react";
import { dateFormater } from "@/utils";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { useCommentsContext } from "@/contexts/CommentsContextProvider";
import { useAuth } from "@/contexts/AuthContextProvider";

interface CommentItemProps {
  comment: TComment;
  token: string;
}

const CommentItem = memo(
  ({ comment, token }: CommentItemProps) => {
    const { setCommentState } = useCommentsContext();
    const { userInfo } = useAuth();

    return (
      <div
        key={comment._id}
        className="p-3 border-2 border-gray-300 dark:border-gray-500 rounded-lg"
      >
        <div className="flex justify-between items-center mb-3">
          <p className="text-xl font-medium text-gray-900 dark:text-white">
            {comment.username}
          </p>
          <time
            dateTime={comment.createdAt}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {dateFormater(comment.createdAt)}
          </time>
        </div>
        <div className="flex justify-between items-center">
          <p className="font-normal text-gray-700 dark:text-gray-400">
            {comment.text}
          </p>
          {comment.user === userInfo?.id && (
            <div className="space-x-4">
              <button
                onClick={() => {
                  setCommentState((prev) => ({
                    ...prev,
                    status: "edit",
                    text: comment.text,
                    id: comment._id,
                  }));
                }}
              >
                <FaRegEdit className="w-6 h-6 text-green-700" />
              </button>
              <button
                onClick={() => {
                  setCommentState((prev) => ({
                    ...prev,
                    id: comment._id,
                    token,
                    openModal: true,
                  }));
                }}
              >
                <FaTrashAlt className="w-6 h-6 text-red-700" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.comment._id === next.comment._id &&
    prev.comment.text === next.comment.text
);

CommentItem.displayName = "CommentItem";

export default CommentItem;
