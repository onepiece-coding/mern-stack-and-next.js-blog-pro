"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from ".";
import { TUser } from "@/types";
import { logoutUser } from "@/actions/auth";
import { useRouter } from "next/navigation";

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const [userInfo, setUserInfo] = useState<TUser | null>(null);

  const logoutHandler = async () => {
    await logoutUser();
    localStorage.removeItem("userInfo");
    setUserInfo(null);
    router.replace("/");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    setUserInfo(storedUser ? JSON.parse(storedUser) : null);
  }, []);

  return (
    <AuthContext.Provider value={{ userInfo, setUserInfo, logoutHandler }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContextProvider;
