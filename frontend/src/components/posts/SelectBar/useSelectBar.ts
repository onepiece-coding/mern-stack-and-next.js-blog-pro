import { useQueryParams } from "@/hooks";
import { useCallback } from "react";

const useSelectBar = () => {
  // Get the current query and updater function.
  const { query, updateQueryParam } = useQueryParams();
  // Derive the current category from the query object.
  const currentCategory = query.category || "";

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      // Update the "category" query param with the new value.
      updateQueryParam("category", e.currentTarget.value);
    },
    [updateQueryParam]
  );

  return { currentCategory, handleChange };
};

export default useSelectBar;
