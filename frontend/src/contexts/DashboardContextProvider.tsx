"use client";

import { useCallback, useContext, useState } from "react";
import { DashboardContext } from ".";
import { HandleDeleteModal } from "@/components/common";
import { toast } from "react-toastify";
import { axiosErrorHandler } from "@/utils";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/api/axiosInstance";

export type DashboardState = {
  open: boolean;
  url: string | null;
  id: string | null;
  token: string | null;
  deletedItem: string | null;
};

const DashboardContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();

  const [dashboardState, setDashboardState] = useState<DashboardState>({
    open: false,
    url: null,
    id: null,
    token: null,
    deletedItem: null,
  });

  const dashboardDeletion = useCallback(async () => {
    try {
      const { data } = await axiosInstance.delete(
        `${dashboardState.url}/${dashboardState?.id}`,
        { headers: { Authorization: `Bearer ${dashboardState?.token}` } }
      );
      toast.success(data.message);
      router.refresh();
    } catch (error) {
      toast.success(axiosErrorHandler(error));
    }
  }, [router, dashboardState.url, dashboardState?.id, dashboardState?.token]);

  const setOpenModal = useCallback((value: boolean) => {
    setDashboardState((prev) => ({ ...prev, open: value }));
  }, []);

  return (
    <DashboardContext.Provider value={{ setDashboardState }}>
      <HandleDeleteModal
        openModal={dashboardState.open}
        setOpenModal={setOpenModal}
        onDelete={dashboardDeletion}
        deletedItem={dashboardState.deletedItem!}
      ></HandleDeleteModal>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = () => useContext(DashboardContext);

export default DashboardContextProvider;
