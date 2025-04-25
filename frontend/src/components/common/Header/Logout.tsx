"use client";

import { useAuth } from "@/contexts/AuthContextProvider";
import { Dropdown } from "flowbite-react";

const Logout = () => {
  const { logoutHandler } = useAuth();

  return <Dropdown.Item onClick={logoutHandler}>Sign out</Dropdown.Item>;
};

export default Logout;
