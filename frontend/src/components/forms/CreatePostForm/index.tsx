"use client";

import { Button, Spinner } from "flowbite-react";
import { TCreatePostFormInputs } from "@/lib/validations/createPostSchema";
import { TCategory } from "@/types";
import { useMemo } from "react";
import TextInput from "../inputs/TextInput";
import SelectInput from "../inputs/SelectInput";
import TextareaInput from "../inputs/Textarea";
import FileInput from "../inputs/FileInput";
import useCreatePostForm from "./useCreatePostForm";

interface CreatePostFormProps {
  categories: TCategory[];
  token: string;
}

const CreatePostForm = ({ token, categories }: CreatePostFormProps) => {
  const { handleSubmit, onSubmit, register, errors, loading } =
    useCreatePostForm(token);

  // Memoize categories to prevent unnecessary re-renders if categories do not change
  const memoizedCategories = useMemo(() => categories, [categories]);

  return (
    <form
      className="flex w-full sm:w-[512px] flex-col gap-4"
      onSubmit={handleSubmit(onSubmit)}
      role="form"
      aria-labelledby="create-post-heading"
    >
      <h2 id="create-post-heading" className="sr-only">
        Create New Post
      </h2>
      <TextInput<TCreatePostFormInputs>
        label="Post Title"
        register={register}
        name={"title"}
        error={errors.title?.message}
        required
      />
      <SelectInput<TCreatePostFormInputs>
        label="Post Category"
        register={register}
        name={"category"}
        defaultValue=""
        error={errors.category?.message}
        options={memoizedCategories.map((category) => ({
          key: category._id,
          value: category.title,
        }))}
        placeholder="Select A Category"
        required
      />
      <TextareaInput<TCreatePostFormInputs>
        label="Post Description"
        register={register}
        name={"description"}
        error={errors.description?.message}
        required
      />
      <FileInput<TCreatePostFormInputs>
        label="Post Image"
        register={register}
        name={"image"}
        error={errors.image?.message as string}
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? (
          <div className="flex items-center gap-2">
            <Spinner aria-label="Submitting post..." /> Loading...
          </div>
        ) : (
          "Create Post"
        )}
      </Button>
    </form>
  );
};

export default CreatePostForm;
