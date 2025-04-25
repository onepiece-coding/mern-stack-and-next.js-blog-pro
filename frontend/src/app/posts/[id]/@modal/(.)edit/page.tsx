import { Modal } from "@/components/common";
import { getAuthToken } from "@/lib/api/authToken.cookie";
import { getCategories } from "@/lib/api/categories.calls";
import { getSinglePost } from "@/lib/api/posts.calls";
import EditPostForm from "@/components/forms/EditPostForm";
import { redirect } from "next/navigation";
import { getMe } from "@/lib/api/profile.calls";

const EditPostModal = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  // Protect Route
  const token = await getAuthToken();

  console.log(token);

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
    <Modal>
      <EditPostForm
        singlePost={singlePost}
        categories={categories}
        token={token}
      />
    </Modal>
  );
};

export default EditPostModal;
