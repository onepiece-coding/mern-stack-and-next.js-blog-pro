import { TComment } from "@/types";
import CommentsList from "./CommentsList";
import SubmitComment from "./SubmitComment";
import CommentsContextProvider from "@/contexts/CommentsContextProvider";
import { memo } from "react";

interface CommentsSectionProps {
  postId: string;
  token: string;
  comments: TComment[];
}

const CommentsSection = memo(
  ({ postId, token, comments }: CommentsSectionProps) => {
    return (
      <CommentsContextProvider>
        <SubmitComment postId={postId} token={token} />
        <CommentsList comments={comments} token={token} />
      </CommentsContextProvider>
    );
  }
);

CommentsSection.displayName = "CommentsSection";

export default CommentsSection;
