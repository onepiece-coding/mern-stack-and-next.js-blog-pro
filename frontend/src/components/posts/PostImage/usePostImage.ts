import { TPost } from "@/types";
import { useCallback, useState } from "react";
import { axiosErrorHandler, compressImage } from "@/utils";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/api/axiosInstance";

const usePostImage = (postId: string, token: string) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File>();

  const hanldeUploadPostImage = useCallback(async () => {
    if (!file) {
      toast.error("Please select an image");
      return;
    }

    setLoading(true);

    try {
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      formData.append("image", compressedFile);
      await axiosInstance.put<TPost>(
        `/api/posts/update-image/${postId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Post Image Updated Successfully");
    } catch (error: unknown) {
      toast.error(axiosErrorHandler(error));
      console.log(axiosErrorHandler(error));
    } finally {
      setLoading(false);
    }
  }, [file, postId, token]);

  return { file, setFile, hanldeUploadPostImage, loading };
};

export default usePostImage;
