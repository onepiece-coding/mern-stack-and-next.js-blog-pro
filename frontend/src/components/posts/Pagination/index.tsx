"use client";

import { Pagination as FlowbitePagination } from "flowbite-react";
import usePagination from "./usePagination";

const Pagination = ({ totalPages }: { totalPages: number }) => {
  const { currentPage, onPageChange } = usePagination();

  return (
    <div
      className="flex overflow-x-auto justify-center mt-4"
      role="navigation"
      aria-label="Pagination Navigation"
    >
      <FlowbitePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        aria-label="Posts pagination"
      />
    </div>
  );
};

export default Pagination;
