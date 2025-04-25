"use client";

import { TPost } from "@/types";
import { Button, FileInput, Label, Spinner } from "flowbite-react";
import { FaImage } from "react-icons/fa6";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useEffect } from "react";
import usePostImage from "./usePostImage";
import Image from "next/image";

interface PostImageProps {
  singlePost: TPost;
  token: string;
}

const PostImage = ({ singlePost, token }: PostImageProps) => {
  const { userInfo } = useAuth();
  const { file, setFile, hanldeUploadPostImage, loading } = usePostImage(
    singlePost._id,
    token
  );

  // Revoke (remove) old blob URL to avoid memory leaks
  useEffect(() => {
    let objectUrl: string;
    if (file) objectUrl = URL.createObjectURL(file);
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return (
    <figure>
      <Image
        src={file ? URL.createObjectURL(file) : singlePost.image.url}
        alt={`Image for post titled "${singlePost.title}"`}
        width={1920}
        height={1080}
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
      />
      {singlePost.user.id === userInfo?.id && (
        <div className="mt-6 flex justify-between items-center">
          <>
            <Label
              className="flex items-center gap-2 cursor-pointer "
              htmlFor="select-image"
            >
              <FaImage className="w-6 h-6" /> Select Image
            </Label>
            <FileInput
              id="select-image"
              onChange={(e) => setFile(e.target.files?.[0])}
              className="sr-only"
            />
          </>
          <Button
            color="green"
            onClick={hanldeUploadPostImage}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner aria-label="Uploading image…" /> Loading...
              </div>
            ) : (
              "Upload Image"
            )}
          </Button>
        </div>
      )}
    </figure>
  );
};

export default PostImage;
