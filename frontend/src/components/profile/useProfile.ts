import { useAuth } from "@/contexts/AuthContextProvider";
import { useCallback, useState } from "react";
import axiosInstance from "@/lib/api/axiosInstance";
import { toast } from "react-toastify";
import { axiosErrorHandler, compressImage } from "@/utils";
import { useRouter } from "next/navigation";

const useProfile = (userId: string, token: string) => {
  const router = useRouter();
  const { logoutHandler, userInfo, setUserInfo } = useAuth();

  const [openEditProfileModal, setOpenEditProfileModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleOpenModal = useCallback(() => {
    setOpenEditProfileModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setOpenEditProfileModal(false);
  }, []);

  const handleOpenDeleteModal = useCallback((value: boolean) => {
    setOpenDeleteModal(value);
  }, []);

  const deleteUserProfile = useCallback(async () => {
    setDeleteLoading(true);

    try {
      await axiosInstance.delete(`/api/users/profile/${userId}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      toast.success("Profile Deleted Successfully.");
      logoutHandler();
    } catch (error: unknown) {
      toast.error(axiosErrorHandler(error));
    } finally {
      setDeleteLoading(false);
    }
  }, [logoutHandler, token, userId]);

  const chooseFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      // Validate file type
      if (!e.target.files[0].type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (e.target.files[0].size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setFile(e.target.files[0]);
    }
  }, []);

  const hanldeUploadProfileImage = useCallback(async () => {
    if (!file) {
      toast.error("Please select an image");
      return;
    }

    setUploadLoading(true);

    try {
      const compressedFile = await compressImage(file);

      const formData = new FormData();
      formData.append("image", compressedFile);

      const { data } = await axiosInstance.post<{
        message: string;
        profilePhoto: { url: string };
      }>(`/api/users/profile/profile-photo-upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: `Bearer ${token}`,
        },
      });
      toast.success(data.message);
      router.refresh();
      setUserInfo({
        ...userInfo!,
        profilePhoto: { url: data.profilePhoto.url },
      });
      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          ...userInfo,
          profilePhoto: { url: data.profilePhoto.url },
        })
      );
    } catch (error: unknown) {
      toast.error(axiosErrorHandler(error));
    } finally {
      setUploadLoading(false);
      setFile(null);
    }
  }, [file, token, router, userInfo, setUserInfo]);

  return {
    openEditProfileModal,
    openDeleteModal,
    deleteLoading,
    uploadLoading,
    file,
    handleOpenModal,
    handleCloseModal,
    handleOpenDeleteModal,
    deleteUserProfile,
    chooseFile,
    hanldeUploadProfileImage,
  };
};

export default useProfile;
