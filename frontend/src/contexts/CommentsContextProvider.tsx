"use client";

import { useCallback, useContext, useState } from "react";
import { CommentsContext } from ".";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { axiosErrorHandler } from "@/utils";
import axiosInstance from "@/lib/api/axiosInstance";
import HandleDeleteModal from "@/components/common/HandleDeleteModal";

export type CommentState = {
  loading: boolean;
  text: string;
  status: "add" | "edit";
  id: string | null;
  token: string | null;
  openModal: boolean;
};

const CommentsContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();

  const [commentState, setCommentState] = useState<CommentState>({
    loading: false,
    text: "",
    status: "add",
    id: null,
    token: null,
    openModal: false,
  });

  const onSubmit = useCallback(
    async (postId: string, token: string) => {
      if (!commentState.text.trim()) {
        toast.error("Comment Text is required!");
        return;
      }

      setCommentState((prev) => ({ ...prev, loading: true }));

      try {
        const config = {
          headers: {
            authorization: `Bearer ${token}`,
          },
        };

        if (commentState.status === "add") {
          await axiosInstance.post(
            "/api/comments",
            {
              text: commentState.text.trim(),
              postId,
            },
            config
          );
          toast.success("Comment added successfully");
        } else if (commentState.status === "edit") {
          await axiosInstance.put(
            `/api/comments/${commentState.id}`,
            {
              text: commentState.text.trim(),
            },
            config
          );
          toast.success("Comment updated successfully");
        }
        setCommentState((prev) => ({
          ...prev,
          text: "",
          status: "add",
          id: null,
        }));
        router.refresh();
      } catch (error) {
        toast.error(axiosErrorHandler(error));
      } finally {
        setCommentState((prev) => ({ ...prev, loading: false }));
      }
    },
    [commentState, router]
  );

  const deleteComment = useCallback(
    async (commentId: string, token: string) => {
      try {
        await axiosInstance.delete(`/api/comments/${commentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Comment deleted successfully");
        router.refresh();
      } catch (error) {
        toast.error(axiosErrorHandler(error));
      }
    },
    [router]
  );

  const setOpenModal = useCallback((value: boolean) => {
    setCommentState((prev) => ({ ...prev, openModal: value }));
  }, []);

  const onDelete = useCallback(() => {
    if (!commentState.id || !commentState.token) {
      throw new Error("No token or id provided!");
    }
    return deleteComment(commentState.id, commentState.token);
  }, [commentState.id, deleteComment, commentState.token]);

  return (
    <CommentsContext value={{ commentState, setCommentState, onSubmit }}>
      <HandleDeleteModal
        openModal={commentState.openModal}
        deletedItem={"comment"}
        setOpenModal={setOpenModal}
        onDelete={onDelete}
      />
      {children}
    </CommentsContext>
  );
};

export const useCommentsContext = () => useContext(CommentsContext);

export default CommentsContextProvider;
