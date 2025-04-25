import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { axiosErrorHandler } from "@/utils";
import axiosInstance from "@/lib/api/axiosInstance";
import {
  createCategorySchema,
  TCreateCategoryFormInput,
} from "@/lib/validations/createCategorySchema";

const useAddCategoryForm = (token: string) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TCreateCategoryFormInput>({
    resolver: zodResolver(createCategorySchema),
  });

  const onSubmit: SubmitHandler<TCreateCategoryFormInput> = async (data) => {
    try {
      setLoading(true);
      await axiosInstance.post(
        "/api/categories",
        { title: data.category },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("New Category Added");
      reset();
      router.refresh();
    } catch (error: unknown) {
      toast.error(axiosErrorHandler(error));
    } finally {
      setLoading(false);
    }
  };
  return { handleSubmit, onSubmit, register, errors, loading };
};

export default useAddCategoryForm;
