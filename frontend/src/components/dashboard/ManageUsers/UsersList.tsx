import { TUser } from "@/types";
import { TableBody } from "flowbite-react";
import { memo } from "react";
import UserItem from "./UserItem";

interface UsersListProps {
  usersList: TUser[];
  token: string;
}

const UsersList = memo(({ usersList, token }: UsersListProps) => {
  return (
    <TableBody className="divide-y">
      {usersList.map((user, index) => (
        <UserItem key={user?.id} user={user} index={index} token={token} />
      ))}
    </TableBody>
  );
});

UsersList.displayName = "UsersList";

export default UsersList;
