import { PaginatedResponse, PostsQueryParams, TPost } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Cache config for fetch requests
 * ISR => Incremental Static Regeneration
 * 1. First Request (Cold Cache):
 * - The first user who visits the page triggers a request to fetch the data.
 * - Next.js caches the generated page.
 * - Subsequent users get the same cached page without a new request.
 * 2. New Request After revalidate Time (60s in Our Case):
 * - If another user requests the page after 60 seconds, Next.js serves the cached page while revalidating the data in the background.
 * - If new data is available, Next.js updates the cached page.
 * - The next request after that will get the updated page.
 * 3. If No Requests Happen:
 * - If no one visits the page for a long time, no extra requests are made.
 * - ISR does not automatically refresh data every 60 seconds unless a new request happens.
 */
// const fetchOptions: RequestInit = {
//   next: {
//     revalidate: 60, // ISR: refresh the cached version after 60 seconds
//   },
// };

export async function getPosts(
  params: PostsQueryParams = {}
): Promise<PaginatedResponse<TPost>> {
  const { pageNumber = "1", category = "", title = "" } = params;

  // Used URL object for safer URL construction
  const url = new URL(`${API_BASE_URL}/api/posts`);
  url.searchParams.append("pageNumber", pageNumber);
  // http://localhost:5000/api/posts?pageNumber=1
  if (category) url.searchParams.append("category", category);
  // http://localhost:5000/api/posts?pageNumber=1&category=cars
  if (title) url.searchParams.append("title", title);
  // http://localhost:5000/api/posts?pageNumber=1&title=bmw

  const response = await fetch(url.toString(), {
    cache: "no-store",
  });

  if (!response.ok) {
    console.error(`Error ${response.status}: Failed to fetch posts`);
    throw new Error(`Error ${response.status}: Failed to fetch posts`);
  }

  return response.json();
}

export async function getSinglePost(postId: string): Promise<TPost> {
  const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    console.error(`Error ${response.status}: Failed to fetch post ${postId}`);
    throw new Error(`Error ${response.status}: Failed to fetch post ${postId}`);
  }

  return response.json();
}
