import { TCategory } from "@/types";
import { TableBody } from "flowbite-react";
import { memo } from "react";
import CategoryItem from "./CategoryItem";

interface CategoriesListProps {
  categoriesList: TCategory[];
  token: string;
}

const CategoriesList = memo(
  ({ categoriesList, token }: CategoriesListProps) => {
    return (
      <TableBody className="divide-y">
        {categoriesList.map((category, index) => (
          <CategoryItem
            key={category?._id}
            category={category}
            index={index}
            token={token}
          />
        ))}
      </TableBody>
    );
  }
);

CategoriesList.displayName = "CategoriesList";

export default CategoriesList;
