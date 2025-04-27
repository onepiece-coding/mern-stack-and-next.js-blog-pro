"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from ".";
import { TUser } from "@/types";
import { logoutUser } from "@/actions/auth";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/api/axiosInstance";
import { axiosErrorHandler } from "@/utils";

const AuthContextProvider = ({
  children,
  token,
}: {
  children: React.ReactNode;
  token: string;
}) => {
  const router = useRouter();

  const [userInfo, setUserInfo] = useState<TUser | null>(null);

  const logoutHandler = async () => {
    await logoutUser();
    localStorage.removeItem("userInfo");
    setUserInfo(null);
    router.replace("/");
  };

  useEffect(() => {
    const getMe = async () => {
      try {
        const { data } = await axiosInstance.get("/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(data);
        setUserInfo(data?.result);
      } catch (error) {
        console.log(axiosErrorHandler(error));
      }
    };
    getMe();
    // const storedUser = localStorage.getItem("userInfo");
    // setUserInfo(storedUser ? JSON.parse(storedUser) : null);
  }, [token]);

  return (
    <AuthContext.Provider value={{ userInfo, setUserInfo, logoutHandler }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContextProvider;
