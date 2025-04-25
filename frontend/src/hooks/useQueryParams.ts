// /hooks/useQueryParams.ts
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";

type QueryParams = { [key: string]: string };

export default function useQueryParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Local state for query parameters as an object.
  const [query, setQuery] = useState<QueryParams>(() => {
    const params: QueryParams = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }); // { category: 'cars', title: 'bmw' }

  // Update local state when searchParams change.
  useEffect(() => {
    const params: QueryParams = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    setQuery(params);
  }, [searchParams]);

  // Function to update a specific query parameter.
  const updateQueryParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (key !== "pageNumber" && searchParams.has("pageNumber")) {
        params.delete("pageNumber");
      }

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // params = category=cars&title=bmw
      // Update the URL. This will trigger a re-render of any components using searchParams.
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  return { query, updateQueryParam };
}
