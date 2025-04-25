import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { axiosErrorHandler } from "@/utils";
import { TPost } from "@/types";
import {
  createPostSchema,
  TCreatePostFormInputs,
} from "@/lib/validations/createPostSchema";
import axiosInstance from "@/lib/api/axiosInstance";
import { compressImage } from "@/utils";

const useCreatePostForm = (token: string) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TCreatePostFormInputs>({
    mode: "onBlur",
    resolver: zodResolver(createPostSchema),
  });

  const onSubmit: SubmitHandler<TCreatePostFormInputs> = async (data) => {
    const { title, description, category, image } = data;
    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);

    // Ensure `image` is an actual File object
    if (image && image[0]) {
      try {
        const compressedFile = await compressImage(image[0]);
        formData.append("image", compressedFile);
      } catch {
        toast.error("Error compressing image");
        return;
      }
    }

    // Log FormData properly
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post<TPost>("/api/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: `Bearer ${token}`,
        },
      });
      reset();
      router.push(`/posts/${response.data._id}`);
      toast.success("New Post Added");
    } catch (error: unknown) {
      toast.error(axiosErrorHandler(error));
      console.log(axiosErrorHandler(error));
    } finally {
      setLoading(false);
    }
  };
  return { handleSubmit, onSubmit, register, errors, loading };
};

export default useCreatePostForm;
