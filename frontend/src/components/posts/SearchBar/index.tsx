"use client";

import { TextInput } from "flowbite-react";
import useSearchBar from "./useSearchBar";

const SearchBar = () => {
  const { handleChange, handleSubmit, searchTerm } = useSearchBar();

  return (
    <form
      className="w-full md:w-2/4"
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search and find posts"
    >
      {/* Using a visually hidden label | sr-only = screen-reader-only */}
      <label htmlFor="search" className="sr-only">
        Search posts
      </label>
      <TextInput
        id="search"
        type="search"
        placeholder="Find Posts"
        aria-label="Search posts..."
        autoComplete="off"
        value={searchTerm}
        onChange={handleChange}
      />
    </form>
  );
};

export default SearchBar;
