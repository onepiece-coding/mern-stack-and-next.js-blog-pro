"use client";

import { TCategory } from "@/types";
import { Select } from "flowbite-react";
import { useMemo } from "react";
import useSelectBar from "./useSelectBar";

const SelectBar = ({ categories }: { categories: TCategory[] }) => {
  const { currentCategory, handleChange } = useSelectBar();

  // Memoize categories to prevent re-renders
  const memoizedCategories = useMemo(() => categories, [categories]);

  return (
    <div className="w-full md:w-1/4">
      {/* Visible label for select */}
      <label htmlFor="categories" className="sr-only">
        Filter by Category
      </label>
      <Select
        id="categories"
        value={currentCategory}
        onChange={handleChange}
        aria-labelledby="categories"
      >
        <option value="">All</option>
        {memoizedCategories.map((category) => (
          <option
            key={category._id}
            value={category.title}
            className="capitalize"
          >
            {category.title}
          </option>
        ))}
      </Select>
    </div>
  );
};

export default SelectBar;
