"use client";

import { useMounted } from "@/hooks/useMounted";
import { paragraphVariants } from "@/components/ui/custom/p";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  RiFilePdf2Fill,
  RiImageFill,
  RiPieChart2Fill,
  RiStarFill,
  RiUserShared2Fill,
  RiVideoFill,
} from "@remixicon/react";
import { usePathname } from "next/navigation";
import { SearchBar } from "./search-bar";

const items = [
  { title: "Documents", url: "/dashboard/documents", icon: RiFilePdf2Fill },
  { title: "Images", url: "/dashboard/images", icon: RiImageFill },
  { title: "Videos", url: "/dashboard/videos", icon: RiVideoFill },
  { title: "Others", url: "/dashboard/others", icon: RiPieChart2Fill },
  { title: "Shared with me", url: "/dashboard/shared", icon: RiUserShared2Fill },
  { title: "Subscription", url: "/dashboard/subscription", icon: RiStarFill },
];

export function AppSidebar() {
  const mounted = useMounted();
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-[#1d1d21] bg-black text-white overflow-hidden">
      <SidebarContent className="bg-[#101010] text-white overflow-hidden">
        <SidebarHeader>
          <SidebarMenu className="space-y-4 mt-3">
            <SidebarMenuItem>
              <SearchBar />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarSeparator className="bg-[#1d1d21]" />
        <SidebarGroup className="bg-[#101010] text-white">
          <SidebarGroupLabel className="text-white py-2">Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="bg-transparent text-white space-y-2">
              {items.map((item) => {
                const isActive = mounted ? pathname?.startsWith(item.url) : false;

                return (
                  <SidebarMenuItem key={item.title} className="hover:bg-black">
                    <SidebarMenuButton asChild>
                      <a
                        href={item.url}
                        className={cn(
                          paragraphVariants({ size: "small", weight: "medium" }),
                          "py-6 px-5 rounded-lg flex items-center gap-2 transition-colors",
                          isActive && "bg-primary drop-shadow-xl"
                        )}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
