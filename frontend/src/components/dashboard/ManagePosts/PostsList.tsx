import { TPost } from "@/types";
import { TableBody } from "flowbite-react";
import { memo } from "react";
import PostItem from "./PostItem";

interface PostsListProps {
  postsList: TPost[];
  token: string;
  pageNumber: number;
}

const PostsList = memo(({ postsList, token, pageNumber }: PostsListProps) => {
  return (
    <TableBody className="divide-y">
      {postsList.map((post, index) => (
        <PostItem
          key={post?._id}
          post={post}
          index={index}
          token={token}
          pageNumber={pageNumber}
        />
      ))}
    </TableBody>
  );
});

PostsList.displayName = "PostsList";

export default PostsList;
