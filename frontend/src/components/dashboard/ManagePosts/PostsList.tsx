import { TPost } from "@/types";
import { TableBody } from "flowbite-react";
import { memo } from "react";
import PostItem from "./PostItem";

interface PostsListProps {
  postsList: TPost[];
  token: string;
}

const PostsList = memo(({ postsList, token }: PostsListProps) => {
  return (
    <TableBody className="divide-y">
      {postsList.map((post, index) => (
        <PostItem key={post?._id} post={post} index={index} token={token} />
      ))}
    </TableBody>
  );
});

PostsList.displayName = "PostsList";

export default PostsList;
