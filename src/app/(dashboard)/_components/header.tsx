"use client";

import SidebarTrigger from "@/components/ui/custom/sidebar-trigger";
import DashboardBreadcrumb from "./breadcrumb";
import UploadButton from "./upload-button";
import HeaderProfile from "./header-profile";
import { useMounted } from "@/hooks/useMounted";

const DashboardHeader = () => {
  const mounted = useMounted();

  if (!mounted) {
    // Prevent hydration mismatch by skipping render on server
    return null;
  }

  return (
    <header className="flex items-center justify-between py-5">
      <div className="flex items-center gap-4 justify-start flex-1">
        <SidebarTrigger />
        <DashboardBreadcrumb />
      </div>
      <div className="w-full h-fit flex items-center gap-4 justify-end flex-1">
        <UploadButton />
        <HeaderProfile />
      </div>
    </header>
  );
};

export default DashboardHeader;
