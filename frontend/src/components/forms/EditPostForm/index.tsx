"use client";

import { Button, Spinner } from "flowbite-react";
import { TCategory, TPost } from "@/types";
import { useMemo } from "react";
import { TEditPostFormInputs } from "@/lib/validations/editPostSchema";
import TextInput from "../inputs/TextInput";
import SelectInput from "../inputs/SelectInput";
import TextareaInput from "../inputs/Textarea";
import useEditPostForm from "./useEditPostForm";

interface CreatePostFormProps {
  singlePost: TPost;
  categories: TCategory[];
  token: string;
}

const EditPostForm = ({
  singlePost,
  categories,
  token,
}: CreatePostFormProps) => {
  const { handleSubmit, onSubmit, register, errors, loading } = useEditPostForm(
    singlePost._id,
    token
  );

  // Memoize categories to prevent unnecessary re-renders if categories do not change
  const memoizedCategories = useMemo(() => categories, [categories]);

  return (
    <form
      className="flex w-full sm:w-[512px] flex-col gap-4"
      onSubmit={handleSubmit(onSubmit)}
      role="form"
      aria-labelledby="edit-post-heading"
    >
      <h2 id="edit-post-heading" className="sr-only">
        Edit Post
      </h2>
      <TextInput<TEditPostFormInputs>
        label="Post Title"
        register={register}
        name={"title"}
        defaultValue={singlePost.title}
        error={errors.title?.message}
        required
      />
      <SelectInput<TEditPostFormInputs>
        label="Post Category"
        register={register}
        name={"category"}
        defaultValue={singlePost.category}
        error={errors.category?.message}
        options={memoizedCategories.map((category) => ({
          key: category._id,
          value: category.title,
        }))}
        placeholder="Select A Category"
        required
      />
      <TextareaInput<TEditPostFormInputs>
        label="Post Description"
        register={register}
        name={"description"}
        defaultValue={singlePost.description}
        error={errors.description?.message}
        required
      />
      <Button type="submit">
        {loading ? (
          <div className="flex items-center gap-2">
            <Spinner aria-label="editing post..." /> Loading...
          </div>
        ) : (
          "Edit Post"
        )}
      </Button>
    </form>
  );
};

export default EditPostForm;
