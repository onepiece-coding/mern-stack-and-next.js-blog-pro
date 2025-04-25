"use client";

import {
  Button,
  DarkThemeToggle,
  Navbar as FlowbiteNavbar,
} from "flowbite-react";
import { usePathname } from "next/navigation";
import { FaPencilAlt } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContextProvider";
import Link from "next/link";
import Dropdown from "./Dropdown";
import { memo, useMemo } from "react";

const Navbar = memo(({ token }: { token: string }) => {
  const pathname = usePathname();
  const { userInfo } = useAuth();

  // Memoize nav links array to avoid re-creation on every render.
  const navItems = useMemo(
    () => [
      {
        label: "Home",
        href: "/",
        roles: ["guest", "user", "admin"],
        isActive: pathname === "/",
      },
      {
        label: "Posts",
        href: "/posts",
        roles: ["guest", "user", "admin"],
        isActive:
          pathname === "/posts" ||
          /^\/posts\/[a-fA-F0-9]{24}(\/edit)?$/.test(pathname),
      },
      {
        label: "Create",
        href: "/posts/create",
        roles: ["user"],
        isActive: pathname === "/posts/create",
      },
      {
        label: "Dashboard",
        href: "/dashboard",
        roles: ["admin"],
        isActive: pathname.startsWith("/dashboard"),
      },
    ],
    [pathname]
  );

  return (
    <FlowbiteNavbar fluid className="bg-gray-200">
      <FlowbiteNavbar.Toggle />
      <FlowbiteNavbar.Brand as={Link} href="/" className="flex gap-1">
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          BLOG
        </span>
        <FaPencilAlt className="w-5 h-5 text-gray-800 dark:text-white" />
      </FlowbiteNavbar.Brand>

      <div className="flex items-center md:order-2 gap-2">
        {token ? (
          <Dropdown userInfo={userInfo} />
        ) : (
          <Button as={Link} href="/login">
            Login
          </Button>
        )}
        <DarkThemeToggle />
      </div>

      <FlowbiteNavbar.Collapse>
        {navItems.map((navItem) => {
          const role = userInfo?.isAdmin ? "admin" : token ? "user" : "guest";
          if (!navItem.roles.includes(role)) return null;
          return (
            <FlowbiteNavbar.Link
              key={navItem.href}
              as={Link}
              href={navItem.href}
              aria-current={navItem.isActive}
              active={navItem.isActive}
            >
              {navItem.label}
            </FlowbiteNavbar.Link>
          );
        })}
      </FlowbiteNavbar.Collapse>
    </FlowbiteNavbar>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
