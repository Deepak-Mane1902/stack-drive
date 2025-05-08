"use client"; // Add this line to mark the file as a client-side component

import { Children } from "@/props/types";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/app-sidebar";
import DashboardHeader from "./_components/header";
import { useMounted } from "@/hooks/useMounted";

const Layout = ({ children }: Children) => {
  const mounted = useMounted();

  if (!mounted) {
    // Optionally, you can return a skeleton or loader here
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full px-5 bg-[#101010] text-white">
        <DashboardHeader />
        <div className="bg-[#1D1D21] text-white w-full min-h-[calc(100vh-80px)] rounded-lg p-5">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
