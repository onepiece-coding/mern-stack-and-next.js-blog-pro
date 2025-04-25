import { TComment } from "@/types";
import CommentItem from "../CommentItem";
import { memo } from "react";

interface CommentsListProps {
  comments: TComment[];
  token: string;
}

const CommentsList = memo(({ comments, token }: CommentsListProps) => {
  return (
    <div className="mt-6">
      <h2 className="pb-3 text-2xl font-bold text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-gray-500 mb-6">
        {comments.length > 0
          ? `${comments.length} ${
              comments.length === 1 ? "Comment" : "Comments"
            }`
          : "No comments yet"}
      </h2>
      <div className="space-y-6">
        {comments.map((comment) => (
          <CommentItem key={comment._id} comment={comment} token={token} />
        ))}
      </div>
    </div>
  );
});

CommentsList.displayName = "CommentsList";

export default CommentsList;
