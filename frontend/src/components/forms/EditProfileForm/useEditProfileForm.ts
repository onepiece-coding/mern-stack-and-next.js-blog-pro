import { useAuth } from "@/contexts/AuthContextProvider";
import axiosInstance from "@/lib/api/axiosInstance";
import {
  editProfileSchema,
  TEditProfileFormInputs,
} from "@/lib/validations/editProfileSchema";
import { TUser } from "@/types";
import { axiosErrorHandler } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";

const useEditProfileForm = (
  userId: string,
  token: string,
  handleCloseModal: () => void
) => {
  const router = useRouter();
  const { userInfo, setUserInfo } = useAuth();

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TEditProfileFormInputs>({
    mode: "onBlur",
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit: SubmitHandler<TEditProfileFormInputs> = async (data) => {
    const updatedUser: { username: string; bio?: string; password?: string } = {
      username: data.username,
      bio: data.bio,
    };

    // Only include password if it's not empty
    if (data.password?.trim() !== "") {
      updatedUser.password = data.password;
    }

    setLoading(true);

    try {
      const { data } = await axiosInstance.put<TUser>(
        `/api/users/profile/${userId}`,
        updatedUser,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Profile Updated Successfully.");
      reset();
      router.refresh();
      setUserInfo({
        ...userInfo!,
        username: data.username,
      });
      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          ...userInfo,
          username: data.username,
        })
      );
    } catch (error: unknown) {
      toast.error(axiosErrorHandler(error));
    } finally {
      setLoading(false);
      handleCloseModal();
    }
  };

  return { handleSubmit, onSubmit, register, errors, loading };
};

export default useEditProfileForm;
