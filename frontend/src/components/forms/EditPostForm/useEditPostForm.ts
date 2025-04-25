import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { axiosErrorHandler } from "@/utils";
import { TPost } from "@/types";
import {
  editPostSchema,
  TEditPostFormInputs,
} from "@/lib/validations/editPostSchema";
import axiosInstance from "@/lib/api/axiosInstance";

const useEditPostForm = (postId: string, token: string) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TEditPostFormInputs>({
    mode: "onBlur",
    resolver: zodResolver(editPostSchema),
  });

  /**
   * handleBack uses a popstate listener to refresh the page after navigating back.
   * Alternatively, you could use router.replace to the same URL.
   */
  const handleBack = () => {
    // 1. Create a popstate listener
    const handlePopState = () => {
      router.refresh(); // Refresh AFTER back navigation
      window.removeEventListener("popstate", handlePopState); // Cleanup
    };

    // Attach listener before triggering back
    window.addEventListener("popstate", handlePopState);

    // Trigger back navigation (go to the previous route)
    router.back();
  };

  const onSubmit: SubmitHandler<TEditPostFormInputs> = async (data) => {
    try {
      setLoading(true);
      await axiosInstance.put<TPost>(`/api/posts/${postId}`, data, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      reset();
      // Trigger back navigation and refresh the original page
      handleBack();
      toast.success("You have edit post in success");
    } catch (error: unknown) {
      toast.error(axiosErrorHandler(error));
      console.log(axiosErrorHandler(error));
    } finally {
      setLoading(false);
    }
  };
  return { handleSubmit, onSubmit, register, errors, loading };
};

export default useEditPostForm;
