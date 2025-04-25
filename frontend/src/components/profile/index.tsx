"use client";

import { TUser } from "../../types/index";
import { useAuth } from "@/contexts/AuthContextProvider";
import { HandleDeleteModal } from "../common";
import ProfileCard from "./ProfileCard";
import EditProfileForm from "../forms/EditProfileForm";
import useProfile from "./useProfile";

interface ProfileProps {
  profile: TUser;
  userId: string;
  token: string;
}

const Profile = ({ profile, userId, token }: ProfileProps) => {
  const { userInfo } = useAuth();
  const {
    openEditProfileModal,
    openDeleteModal,
    uploadLoading,
    file,
    handleOpenModal,
    handleCloseModal,
    deleteUserProfile,
    chooseFile,
    hanldeUploadProfileImage,
    handleOpenDeleteModal,
  } = useProfile(userId, token);

  const isCurrentUser = userInfo?.id === userId;

  return (
    <div className="flex justify-center">
      <ProfileCard
        profile={profile}
        uploadLoading={uploadLoading}
        isCurrentUser={isCurrentUser}
        file={file}
        handleOpenModal={handleOpenModal}
        handleOpenDeleteModal={handleOpenDeleteModal}
        chooseFile={chooseFile}
        hanldeUploadProfileImage={hanldeUploadProfileImage}
      />

      {isCurrentUser && (
        <>
          <EditProfileForm
            userId={userId}
            token={token}
            profile={profile}
            openModal={openEditProfileModal}
            handleCloseModal={handleCloseModal}
          />
          <HandleDeleteModal
            openModal={openDeleteModal}
            deletedItem={"profile"}
            setOpenModal={handleOpenDeleteModal}
            onDelete={deleteUserProfile}
          />
        </>
      )}
    </div>
  );
};

export default Profile;
