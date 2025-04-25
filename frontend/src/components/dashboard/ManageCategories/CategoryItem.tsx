"use client";

import { useDashboardContext } from "@/contexts/DashboardContextProvider";
import { TCategory } from "@/types";
import { TableCell, TableRow } from "flowbite-react";
import { memo } from "react";

interface CategoryItemProps {
  category: TCategory;
  index: number;
  token: string;
}

const CategoryItem = memo(
  ({ category, index, token }: CategoryItemProps) => {
    const { setDashboardState } = useDashboardContext();

    return (
      <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
        <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
          {index < 9 ? `0${index + 1}` : index + 1}
        </TableCell>
        <TableCell className="whitespace-nowrap">{category?.title}</TableCell>
        <TableCell className="whitespace-nowrap">
          <button
            className="font-medium text-red-600 hover:underline dark:text-red-500"
            onClick={() =>
              setDashboardState({
                open: true,
                url: "/api/categories",
                id: category?._id,
                token,
                deletedItem: "Category",
              })
            }
          >
            Delete Category
          </button>
        </TableCell>
      </TableRow>
    );
  },
  (prev, next) => prev.category._id === next.category._id
);

CategoryItem.displayName = "CategoryItem";

export default CategoryItem;
