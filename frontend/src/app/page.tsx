import { Metadata } from "next";
import { PostCard, SelectBar } from "@/components/posts";
import { getPosts } from "@/lib/api/posts.calls";
import { getCategories } from "@/lib/api/categories.calls";
import { Alert, Button } from "flowbite-react";
import { Heading } from "@/components/common";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog Pro | Your Source for Trending Blogs",
  description:
    "Stay updated with the latest blog posts in technology, lifestyle, and entertainment.",
  keywords: ["blog", "articles", "posts", "latest news"],
  openGraph: {
    title: "Blog Pro | Your Source for Trending Blogs",
    description:
      "Stay updated with the latest blog posts in technology, lifestyle, and entertainment.",
    type: "website",
    url: "http://localhost:3000/",
  },
  twitter: {
    title: "Blog Pro | Latest Tech & Lifestyle Articles",
    description:
      "Stay updated with the latest blog posts in technology, lifestyle, and entertainment.",
  },
};

interface HomePageProps {
  searchParams: Promise<{
    title: string;
    category: string;
  }>;
}

const HomePage = async ({ searchParams }: HomePageProps) => {
  // await new Promise((resolver) => setTimeout(resolver, 10000));

  const { title, category } = await searchParams;

  const [postsData, categories] = await Promise.all([
    getPosts({
      pageNumber: "1",
      category: category || "",
      title: title || "",
    }),
    getCategories(),
  ]);

  return (
    <section className="container mx-auto p-6">
      <div className="flex max-md:flex-col justify-between items-center mb-6 max-md:gap-6">
        <Heading />
        {postsData.posts.length > 0 && <SelectBar categories={categories} />}
      </div>
      {postsData.posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {postsData.posts.map((post, index) => (
              <PostCard key={post._id} {...post} index={index} />
            ))}
          </div>
          <Button
            className="w-fit mx-auto mt-6"
            as={Link}
            href="/posts"
            aria-label="Explore More Posts"
            /**
             * Any <Link /> that is in the viewport (initially or through scroll) will be prefetched.
             * Prefetch can be disabled by passing prefetch={false}.
             * Prefetching is only enabled in production.
             */
            prefetch={false} // جلب مسبق
          >
            Explore More Posts
          </Button>
        </>
      ) : (
        <Alert color="info" className="lg:w-2/5 mx-auto" role="status">
          No{" "}
          <span className="font-medium" aria-live="polite">
            Posts
          </span>{" "}
          To Show!
        </Alert>
      )}
    </section>
  );
};

export default HomePage;
