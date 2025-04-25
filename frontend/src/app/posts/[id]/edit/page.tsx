import EditPostForm from "@/components/forms/EditPostForm";
import { getAuthToken } from "@/lib/api/authToken.cookie";
import { getCategories } from "@/lib/api/categories.calls";
import { getSinglePost } from "@/lib/api/posts.calls";
import { getMe } from "@/lib/api/profile.calls";
import { redirect } from "next/navigation";

const EditPostPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  // await new Promise((resolver) => setTimeout(resolver, 10000));

  // Protect Route
  const token = await getAuthToken();

  if (!token) {
    // not signed in? right away go to /login
    redirect("/login");
  }

  const { id: postId } = await params;

  const [{ result }, singlePost] = await Promise.all([
    getMe(token),
    getSinglePost(postId),
  ]);

  if (result.id !== singlePost.user.id) {
    redirect("/");
  }

  const categories = await getCategories();

  return (
    <section className="min-h-[calc(100vh-62px)] container mx-auto p-6 flex flex-col justify-center items-center">
      <EditPostForm
        singlePost={singlePost}
        categories={categories}
        token={token}
      />
    </section>
  );
};

export default EditPostPage;
