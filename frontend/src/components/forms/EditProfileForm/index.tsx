"use client";

import { TUser } from "@/types";
import { Button, Modal, ModalBody, ModalHeader, Spinner } from "flowbite-react";
import TextInput from "../inputs/TextInput";
import PasswordInput from "../inputs/PasswordInput";
import useEditProfileForm from "./useEditProfileForm";

interface EditProfileFormProps {
  userId: string;
  token: string;
  profile: TUser;
  openModal: boolean;
  handleCloseModal: () => void;
}

const EditProfileForm = ({
  userId,
  token,
  profile,
  openModal,
  handleCloseModal,
}: EditProfileFormProps) => {
  const { handleSubmit, onSubmit, register, errors, loading } =
    useEditProfileForm(userId, token, handleCloseModal);

  return (
    <Modal
      show={openModal}
      size="lg"
      onClose={handleCloseModal}
      aria-labelledby="edit-profile-modal"
      popup
    >
      <ModalHeader />
      <ModalBody>
        <form
          className="space-y-4"
          onSubmit={handleSubmit(onSubmit)}
          role="form"
          aria-labelledby="create-post-heading"
        >
          <h2 id="register-user-heading" className="sr-only">
            Update Profile
          </h2>
          <TextInput
            label="Your Username"
            name={"username"}
            register={register}
            defaultValue={profile?.username || ""}
            error={errors.username?.message}
            required
          />
          <TextInput
            label="Your Bio"
            name={"bio"}
            register={register}
            defaultValue={profile?.bio || ""}
            error={errors.bio?.message}
          />
          <PasswordInput
            label="Your Password"
            name={"password"}
            register={register}
            error={errors?.password?.message}
            required
          />
          <Button type="submit">
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner aria-label="Profile Editing..." /> Loading...
              </div>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </ModalBody>
    </Modal>
  );
};

export default EditProfileForm;
