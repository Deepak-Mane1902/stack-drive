"use client";

import { cn } from "@/lib/utils";
import { Button } from "../button";
import { useSidebar } from "../sidebar";
import { RiSidebarFoldFill, RiSidebarUnfoldFill } from "@remixicon/react";
import { useMounted } from "@/hooks/useMounted";

function SidebarTrigger({
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar, state } = useSidebar();
  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-fit")}
      onClick={() => {
        toggleSidebar();
      }}
      {...props}
    >
      {state === "expanded" ? <RiSidebarFoldFill /> : <RiSidebarUnfoldFill />}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

export default SidebarTrigger;
