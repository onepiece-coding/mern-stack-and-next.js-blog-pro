import { useCallback, useEffect, useMemo, useState } from "react";
import { axiosErrorHandler } from "@/utils";
import { toast } from "react-toastify";
import { TPost } from "@/types";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/api/axiosInstance";

const usePostDetails = (singlePost: TPost, token: string, userId: string) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [likes, setLikes] = useState<string[]>(singlePost.likes);

  const isLiked = useMemo(() => likes.includes(userId), [likes, userId]);

  const handleToggleLike = useCallback(async () => {
    if (!token) {
      toast.info("login first is required to like this post!");
      return;
    }

    const isLiked = likes.includes(userId);
    const updatedLiked = isLiked
      ? likes.filter((id) => id !== userId)
      : [...likes, userId];
    setLikes(updatedLiked); // Optimistic update

    try {
      const { data } = await axiosInstance.put<TPost>(
        `/api/posts/like/${singlePost._id}`,
        null,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      setLikes(data.likes); // Ensure we sync server state
    } catch (error) {
      setError(axiosErrorHandler(error));
      setLikes(likes); // Revert in case of error
    }
  }, [likes, token, userId, singlePost._id]);

  const handleDeletePost = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await axiosInstance.delete<{ message: string }>(
        `/api/posts/${singlePost._id}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(data.message);
      router.replace("/posts");
    } catch (error) {
      toast.error(axiosErrorHandler(error));
    }
  }, [router, singlePost._id, token]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return { handleToggleLike, likes, isLiked, handleDeletePost };
};

export default usePostDetails;
