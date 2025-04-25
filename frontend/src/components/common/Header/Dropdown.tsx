import { Avatar, Dropdown as FlowbiteDropdown } from "flowbite-react";
import { TUser } from "@/types";
import Logout from "./Logout";
import Link from "next/link";

const Dropdown = ({ userInfo }: { userInfo: TUser | null }) => {
  return (
    <FlowbiteDropdown
      arrowIcon={false}
      inline
      label={
        <Avatar
          alt={userInfo?.username}
          img={userInfo?.profilePhoto.url}
          rounded
        />
      }
    >
      <FlowbiteDropdown.Header>
        <span className="block text-sm">{userInfo?.username}</span>
      </FlowbiteDropdown.Header>
      <FlowbiteDropdown.Item as={Link} href={`/profile/${userInfo?.id}`}>
        Your Profile
      </FlowbiteDropdown.Item>
      <FlowbiteDropdown.Divider />
      <Logout />
    </FlowbiteDropdown>
  );
};

export default Dropdown;
