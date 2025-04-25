"use client";

import { useDashboardContext } from "@/contexts/DashboardContextProvider";
import { TUser } from "@/types";
import { TableCell, TableRow } from "flowbite-react";
import Link from "next/link";
import { memo } from "react";

interface UserItemProps {
  user: TUser;
  index: number;
  token: string;
}

const UserItem = memo(
  ({ user, index, token }: UserItemProps) => {
    const { setDashboardState } = useDashboardContext();

    return (
      <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
        <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
          {index < 9 ? `0${index + 1}` : index + 1}
        </TableCell>
        <TableCell className="whitespace-nowrap">{user?.username}</TableCell>
        <TableCell className="whitespace-nowrap">{user?.email}</TableCell>
        <TableCell className="whitespace-nowrap">
          <Link
            href={`/profile/${user?.id}`}
            className="font-medium text-cyan-600 hover:underline dark:text-cyan-500 me-4"
          >
            View Profile
          </Link>
          {!user?.isAdmin && (
            <button
              className="font-medium text-red-600 hover:underline dark:text-red-500"
              onClick={() =>
                setDashboardState({
                  open: true,
                  url: "/api/users/profile",
                  id: user?.id,
                  token,
                  deletedItem: "User",
                })
              }
            >
              Delete User
            </button>
          )}
        </TableCell>
      </TableRow>
    );
  },
  (prev, next) => prev.user.id === next.user.id
);

UserItem.displayName = "UserItem";

export default UserItem;
