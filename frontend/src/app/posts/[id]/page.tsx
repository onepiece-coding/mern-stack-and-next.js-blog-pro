import { getSinglePost } from "@/lib/api/posts.calls";
import { Metadata } from "next";
import { PostDetails, PostImage } from "@/components/posts";
import { getAuthToken } from "@/lib/api/authToken.cookie";
import CommentsSection from "@/components/comments";

interface SinglePostPageProps {
  params: Promise<{ id: string }>;
}

/*
 - When using generateMetadata, Next.js is designed to inject your metadata into the document head at build time (or on demand with ISR).
*/

export async function generateMetadata({
  params,
}: SinglePostPageProps): Promise<Metadata> {
  try {
    const { id: postId } = await params;
    const post = await getSinglePost(postId);
    return {
      title: post.title,
      description: post.description,
      openGraph: {
        title: post.title,
        description: post.description,
        url: `https://yourdomain.com/posts/${postId}`,
        type: "article",
      },
      twitter: {
        title: post.title,
        description: post.description,
        card: "summary_large_image",
        images: post.image?.url ? [post.image.url] : [],
      },
    };
  } catch {
    return {
      title: "Post Not Found!",
      description: "The post you're looking for doesn't exist",
    };
  }
}

const SinglePostPage = async ({ params }: SinglePostPageProps) => {
  // await new Promise((resolver) => setTimeout(resolver, 10000));

  const { id: postId } = await params;

  const [singlePost, token] = await Promise.all([
    getSinglePost(postId),
    getAuthToken(),
  ]);

  return (
    <section className="container mx-auto p-6">
      <div className="flex justify-center">
        <div className="lg:w-3/5">
          <PostImage singlePost={singlePost} token={token} />
          <PostDetails singlePost={singlePost} token={token} />
          <CommentsSection
            postId={singlePost._id}
            token={token}
            comments={singlePost.comments}
          />
        </div>
      </div>
    </section>
  );
};

export default SinglePostPage;
