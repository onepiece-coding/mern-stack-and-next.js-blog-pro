"use client";

import { TCreateCategoryFormInput } from "@/lib/validations/createCategorySchema";
import { Button, Spinner } from "flowbite-react";
import { memo } from "react";
import TextInput from "../inputs/TextInput";
import useAddCategoryForm from "./useAddCategoryForm";

const AddCategoryForm = memo(({ token }: { token: string }) => {
  const { handleSubmit, onSubmit, register, errors, loading } =
    useAddCategoryForm(token);

  return (
    <section className="py-4 px-2 sm:px-4 flex justify-center">
      <div className="p-4 rounded-lg bg-gray-200 dark:bg-gray-800">
        <form
          className="flex w-full sm:w-[512px] flex-col gap-4"
          onSubmit={handleSubmit(onSubmit)}
          role="Login User"
          aria-labelledby="login-user-heading"
          aria-live="polite"
        >
          <h2 id="create-post-heading" className="sr-only">
            Add New Category
          </h2>
          <TextInput<TCreateCategoryFormInput>
            label="Category Title"
            register={register}
            name={"category"}
            error={errors.category?.message}
            required
          />
          <Button type="submit">
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner aria-label="adding category..." /> Loading...
              </div>
            ) : (
              "Add Category"
            )}
          </Button>
        </form>
      </div>
    </section>
  );
});

AddCategoryForm.displayName = "AddCategoryForm";

export default AddCategoryForm;
