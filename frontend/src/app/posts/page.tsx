import { Metadata } from "next";
import { Pagination, PostCard, SearchBar, SelectBar } from "@/components/posts";
import { getPosts } from "@/lib/api/posts.calls";
import { getCategories } from "@/lib/api/categories.calls";
import { Alert } from "flowbite-react";

interface PostsPageProps {
  searchParams: Promise<{
    pageNumber?: string;
    title?: string;
    category?: string;
  }>;
}

export const generateMetadata = async ({
  searchParams,
}: PostsPageProps): Promise<Metadata> => {
  const { category, title } = await searchParams;

  let dynamicTitle = "Explore All Posts | Blog Pro";
  let dynamicDescription =
    "Browse through our collection of posts on various topics.";

  if (category) {
    dynamicTitle = `Explore ${category} Posts | Blog Pro`;
    dynamicDescription = `Explore posts in the ${category} category.`;
  } else if (title) {
    dynamicTitle = `Search Results for "${title}" | Blog Pro`;
    dynamicDescription = `Posts matching your search for "${title}".`;
  }

  return {
    title: dynamicTitle,
    description: dynamicDescription,
    /* adding Open Graph and Twitter Card details for richer previews when sharing links. */
    openGraph: {
      title: dynamicTitle,
      description: dynamicDescription,
      url: "https://yourdomain.com/posts",
      type: "website",
    },
    twitter: {
      title: dynamicTitle,
      description: dynamicDescription,
    },
  };
};

const PostsPage = async ({ searchParams }: PostsPageProps) => {
  // await new Promise((resolver) => setTimeout(resolver, 10000));

  const { pageNumber = "1", title = "", category = "" } = await searchParams;

  const [postsData, categories] = await Promise.all([
    getPosts({ pageNumber, category, title }),
    getCategories(),
  ]);

  return (
    <section className="container mx-auto p-6">
      {postsData.posts.length > 0 ? (
        <>
          <div className="flex max-md:flex-col justify-between items-center mb-6 max-md:gap-6">
            <SearchBar />
            <SelectBar categories={categories} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {postsData.posts.map((post, index) => (
              <PostCard key={post._id} {...post} index={index} />
            ))}
          </div>
        </>
      ) : (
        <Alert color="info" className="lg:w-2/5 mx-auto">
          No <span className="font-medium">Posts</span> To Show!
        </Alert>
      )}
      {postsData.totalPages > 1 && (
        <Pagination totalPages={postsData.totalPages} />
      )}
    </section>
  );
};

export default PostsPage;
