"use client";

import { TPost } from "@/types";
import { memo, useState } from "react";
import { useAuth } from "@/contexts/AuthContextProvider";
import { HandleDeleteModal } from "@/components/common";
import usePostDetails from "./usePostDetails";
import PostHeader from "./PostHeader";
import PostFooter from "./PostFooter";

interface PostDetailsProps {
  singlePost: TPost;
  token: string;
}

const PostDetails = memo(({ singlePost, token }: PostDetailsProps) => {
  const { userInfo } = useAuth();
  const userId = userInfo?.id as string;
  const { handleToggleLike, likes, isLiked, handleDeletePost } = usePostDetails(
    singlePost,
    token,
    userId
  );

  const [openModal, setOpenModal] = useState(false);

  return (
    <article className="mt-6">
      <HandleDeleteModal
        openModal={openModal}
        deletedItem={"post"}
        setOpenModal={setOpenModal}
        onDelete={handleDeletePost}
      />

      <PostHeader
        singlePost={singlePost}
        isLiked={isLiked}
        likes={likes}
        handleToggleLike={handleToggleLike}
      />

      <p className="mt-6 font-normal text-gray-700 dark:text-gray-400">
        {singlePost.description}
      </p>

      <PostFooter
        singlePost={singlePost}
        userId={userId}
        setOpenModal={setOpenModal}
      />
    </article>
  );
});

PostDetails.displayName = "PostDetails";

export default PostDetails;
