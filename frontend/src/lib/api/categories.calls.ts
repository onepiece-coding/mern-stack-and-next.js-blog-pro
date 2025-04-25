import { TCategory } from "@/types";
import { cache } from "react";

export const getCategories = cache(async (): Promise<TCategory[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/categories`
  );

  if (!response.ok) {
    console.error(`Error ${response.status}: Failed to fetch categories!`);
    throw new Error(`Error ${response.status}: Failed to fetch categories!`);
  }

  return response.json();
});
