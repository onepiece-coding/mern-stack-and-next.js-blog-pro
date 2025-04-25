import { Metadata } from "next";
import { getCategories } from "@/lib/api/categories.calls";
import { CreatePostForm } from "@/components/forms";
import { getAuthToken } from "@/lib/api/authToken.cookie";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Blog Pro | Create New Post",
  description: "Create and publish new blog posts on our platform",
  openGraph: {
    title: "Blog Pro | Create New Post",
    description: "Create and publish new blog posts on our platform",
    type: "website",
    url: "http://localhost:3000/",
  },
  twitter: {
    title: "Blog Pro | Create New Post",
    description: "Create and publish new blog posts on our platform",
  },
};

const CreatePostPage = async () => {
  // await new Promise((resolver) => setTimeout(resolver, 10000));

  const token = await getAuthToken();

  if (!token) {
    redirect("/login");
  }

  const categories = await getCategories();

  return (
    <section className="min-h-[calc(100vh-62px)] container mx-auto p-6 flex flex-col justify-center items-center">
      <CreatePostForm token={token} categories={categories} />
    </section>
  );
};

export default CreatePostPage;
