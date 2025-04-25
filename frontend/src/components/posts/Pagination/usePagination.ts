import { useQueryParams } from "@/hooks";
import { useCallback } from "react";

const usePagination = () => {
  const { query, updateQueryParam } = useQueryParams();
  const currentPage = Number(query.pageNumber) || 1;

  const onPageChange = useCallback(
    (page: number) => {
      if (currentPage === page) return;
      updateQueryParam("pageNumber", String(page));
    },
    [currentPage, updateQueryParam]
  );

  return { currentPage, onPageChange };
};

export default usePagination;
