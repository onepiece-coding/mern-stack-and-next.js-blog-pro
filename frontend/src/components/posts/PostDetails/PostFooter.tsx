import { TPost } from "@/types";
import { Button } from "flowbite-react";
import Link from "next/link";

interface PostFooterProps {
  singlePost: TPost;
  userId: string;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const PostFooter = ({ singlePost, userId, setOpenModal }: PostFooterProps) => {
  return (
    <>
      {singlePost.user.id === userId && (
        <footer className="mt-6 flex items-center justify-between">
          <Link href={`/posts/${singlePost._id}/edit`} scroll={false}>
            <Button color="success">Edit Post</Button>
          </Link>
          <Button color="failure" onClick={() => setOpenModal(true)}>
            Delete Post
          </Button>
        </footer>
      )}
    </>
  );
};

export default PostFooter;
