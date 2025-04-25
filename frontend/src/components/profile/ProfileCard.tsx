import { TUser } from "@/types";
import { dateFormater } from "@/utils";
import { Badge, Card, FileInput, Label, Spinner } from "flowbite-react";
import { FaCamera } from "react-icons/fa";
import Image from "next/image";

interface ProfileCardProps {
  profile: TUser;
  uploadLoading: boolean;
  isCurrentUser: boolean;
  file: File | null;
  handleOpenModal: () => void;
  handleOpenDeleteModal: (value: boolean) => void;
  chooseFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hanldeUploadProfileImage: () => void;
}

const ProfileCard = ({
  profile,
  uploadLoading,
  isCurrentUser,
  file,
  handleOpenModal,
  handleOpenDeleteModal,
  chooseFile,
  hanldeUploadProfileImage,
}: ProfileCardProps) => {
  const imageUrl = file ? URL.createObjectURL(file) : profile.profilePhoto?.url;

  return (
    <Card className="min-w-[364px]">
      <div className="flex flex-col items-center">
        <div className="relative mb-3">
          <Image
            alt={profile?.username}
            width={96}
            height={96}
            src={imageUrl}
            className="rounded-full shadow-lg w-24 h-24 object-cover"
            priority
          />

          {isCurrentUser && (
            <>
              <Label
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                htmlFor="select-image"
                aria-label="Change profile photo"
              >
                <FaCamera className="w-7 h-7 text-cyan-700" />
              </Label>
              <FileInput
                id="select-image"
                onChange={chooseFile}
                accept="image/*"
                className="sr-only"
              />

              {file && (
                <button
                  className="absolute bottom-0 right-[-60px]"
                  onClick={hanldeUploadProfileImage}
                  disabled={uploadLoading}
                  aria-label="Upload profile photo"
                >
                  <Badge color="success" className="flex items-center gap-1">
                    {uploadLoading ? (
                      <Spinner aria-hidden="true" size="sm" />
                    ) : (
                      "Upload"
                    )}
                  </Badge>
                </button>
              )}
            </>
          )}
        </div>

        <h5 className="mb-2 text-xl font-medium text-gray-900 dark:text-white">
          {profile?.username}
        </h5>

        <p className="mb-2 text-base text-gray-900 dark:text-white">
          {profile?.bio}
        </p>

        <time
          dateTime={profile?.createdAt}
          className="text-sm text-gray-500 dark:text-gray-400"
        >
          Date Joined: {dateFormater(profile?.createdAt)}
        </time>
        {isCurrentUser && (
          <div className="mt-4 flex space-x-3">
            <button
              className="inline-flex items-center rounded-lg bg-cyan-700 px-4 py-2 text-center text-sm font-medium text-white hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-cyan-800"
              onClick={handleOpenModal}
              aria-label="Edit profile"
            >
              Edit Profile
            </button>
            <button
              className="inline-flex items-center rounded-lg bg-red-700 px-4 py-2 text-center text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
              onClick={() => handleOpenDeleteModal(true)}
              aria-label="Delete profile"
            >
              Delete Profile
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProfileCard;
