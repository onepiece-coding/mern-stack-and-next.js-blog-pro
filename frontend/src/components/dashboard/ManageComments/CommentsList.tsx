import { TComment } from "@/types";
import { TableBody } from "flowbite-react";
import { memo } from "react";
import CommentItem from "./CommentItem";

interface CommentsListProps {
  commentsList: TComment[];
  token: string;
}

const CommentsList = memo(({ commentsList, token }: CommentsListProps) => {
  return (
    <TableBody className="divide-y">
      {commentsList.map((comment, index) => (
        <CommentItem
          key={comment?._id}
          comment={comment}
          index={index}
          token={token}
        />
      ))}
    </TableBody>
  );
});

CommentsList.displayName = "CommentsList";

export default CommentsList;
