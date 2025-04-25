"use client";

import {
  Sidebar,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
} from "flowbite-react";
import { FaUser, FaBloggerB, FaTag, FaComment } from "react-icons/fa";
import { MdSpaceDashboard } from "react-icons/md";
import { usePathname } from "next/navigation";
import Link from "next/link";

const adminLinks = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: MdSpaceDashboard,
  },
  {
    label: "Users",
    path: "/dashboard/manage-users",
    icon: FaUser,
  },
  {
    label: "Posts",
    path: "/dashboard/manage-posts",
    icon: FaBloggerB,
  },
  {
    label: "Categories",
    path: "/dashboard/manage-categories",
    icon: FaTag,
  },
  {
    label: "Comments",
    path: "/dashboard/manage-comments",
    icon: FaComment,
  },
];

const DashboardSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar
      aria-label="Admin sidebar"
      collapsed={true}
      theme={{
        root: {
          base: "h-auto",
          inner:
            "h-full overflow-y-auto overflow-x-hidden rounded bg-gray-50 px-3 py-4 dark:bg-gray-800 rounded-none dark:border-t dark:border-gray-700",
        },
      }}
    >
      <SidebarItems>
        <SidebarItemGroup>
          {adminLinks.map((adminLink) => {
            const isActive = pathname === adminLink.path;
            return (
              <SidebarItem
                key={adminLink.label}
                icon={adminLink.icon}
                className={isActive ? "bg-gray-100 dark:bg-gray-700" : ""}
                as={Link}
                href={adminLink.path}
              >
                {adminLink.label}
              </SidebarItem>
            );
          })}
        </SidebarItemGroup>
      </SidebarItems>
    </Sidebar>
  );
};

export default DashboardSidebar;
