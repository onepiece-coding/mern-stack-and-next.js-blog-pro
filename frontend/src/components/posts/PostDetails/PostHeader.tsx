import { BiLike, BiSolidLike } from "react-icons/bi";
import { dateFormater } from "@/utils";
import { TPost } from "@/types";
import Image from "next/image";
import { Button } from "flowbite-react";
import Link from "next/link";

interface PostHeaderProps {
  singlePost: TPost;
  isLiked: boolean;
  likes: string[];
  handleToggleLike: () => void;
}

const PostHeader = ({
  singlePost,
  isLiked,
  likes,
  handleToggleLike,
}: PostHeaderProps) => {
  return (
    <header>
      <h1 className="text-2xl text-center font-bold tracking-tight text-gray-900 dark:text-white">
        {singlePost.title}
      </h1>
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={singlePost.user.profilePhoto.url}
            alt={singlePost.user.username}
            width={60}
            height={60}
            loading="lazy"
            className="rounded-full w-[60px] h-[60px] object-cover"
          />
          <div>
            <Link
              className="block mb-1 text-xl font-medium text-gray-900 dark:text-white"
              href={`/profile/${singlePost.user.id}`}
            >
              {singlePost.user.username}
            </Link>
            <time
              dateTime={singlePost.createdAt}
              className="text-sm text-gray-500 dark:text-gray-400"
            >
              {dateFormater(singlePost.createdAt)}
            </time>
          </div>
        </div>
        <Button
          aria-label="To like the post"
          aria-pressed={isLiked}
          onClick={handleToggleLike}
          color={isLiked ? "green" : "info"}
        >
          <div className="flex items-center gap-1">
            {isLiked ? (
              <BiSolidLike className="w-6 h-6" />
            ) : (
              <BiLike className="w-6 h-6" />
            )}
            <span className="text-lg">{likes.length}</span>
          </div>
        </Button>
      </div>
    </header>
  );
};

export default PostHeader;
