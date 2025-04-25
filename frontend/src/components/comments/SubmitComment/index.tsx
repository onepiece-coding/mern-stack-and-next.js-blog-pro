"use client";

import { Button, Spinner, Textarea } from "flowbite-react";
import { useCommentsContext } from "@/contexts/CommentsContextProvider";
import { FormEvent, memo } from "react";

interface SubmitCommentProps {
  postId: string;
  token: string;
}

const SubmitComment = memo(({ postId, token }: SubmitCommentProps) => {
  const { commentState, setCommentState, onSubmit } = useCommentsContext();

  const submitHandler = (e: FormEvent) => {
    e.preventDefault();

    onSubmit(postId, token);
  };

  return (
    <form
      className="flex flex-col gap-4 mt-6"
      role="form"
      aria-labelledby="comment-form-heading"
      onSubmit={submitHandler}
    >
      <h2 id="comment-form-heading" className="text-xl font-bold">
        {commentState.status === "add" ? "Add a Comment" : "Edit Comment"}
      </h2>
      <Textarea
        value={commentState.text}
        onChange={(e) =>
          setCommentState((prev) => ({ ...prev, text: e.target.value }))
        }
        placeholder="Share your thoughts..."
        rows={4}
      />

      <div className="flex gap-2">
        <Button type="submit" disabled={commentState.loading}>
          {commentState.loading ? (
            <span className="flex items-center gap-2">
              <Spinner aria-hidden="true" size="sm" />
              {commentState.status === "add" ? "Posting..." : "Updating..."}
            </span>
          ) : commentState.status === "add" ? (
            "Post Comment"
          ) : (
            "Update Comment"
          )}
        </Button>

        {commentState.status === "edit" && (
          <Button
            color="gray"
            onClick={() =>
              setCommentState((prev) => ({
                ...prev,
                status: "add",
                text: "",
                id: null,
              }))
            }
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
});

SubmitComment.displayName = "SubmitComment";

export default SubmitComment;
