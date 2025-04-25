import { useQueryParams } from "@/hooks";
import { useCallback, useEffect, useState } from "react";

const useSearchBar = () => {
  const { query, updateQueryParam } = useQueryParams();
  const [searchTerm, setSearchTerm] = useState(query.title || "");

  const handleChange = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setSearchTerm(e.currentTarget.value);
  }, []);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      // Update the "title" query parameter.
      updateQueryParam("title", searchTerm.trim());
    },
    [searchTerm, updateQueryParam]
  );

  useEffect(() => {
    // Keep local state in sync with the query parameter.
    setSearchTerm(query.title || "");
  }, [query.title]);

  return { handleChange, handleSubmit, searchTerm };
};

export default useSearchBar;
