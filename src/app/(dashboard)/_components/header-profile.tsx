"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { signOut, useSession } from "@/lib/better-auth/auth-client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { paragraphVariants } from "@/components/ui/custom/p";
import { RiLogoutCircleFill } from "@remixicon/react";
import { useMounted } from "@/hooks/useMounted";

const HeaderProfile = () => {
  const session = useSession();
  const router = useRouter();
  const { isPending, data } = session;
  const mounted = useMounted();

  if (!mounted) return null;

  return (
    <>
      {isPending ? (
        <Skeleton className="size-10 rounded-full" />
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src={data?.user?.image as string} alt={data?.user?.name || "User"} />
              <AvatarFallback>
                {(data?.user?.name as string)?.slice(0, 1)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#101010] border-none px-2">
            <DropdownMenuLabel
              className={cn(
                paragraphVariants({ size: "medium", weight: "bold" }),
                "text-[#fff]"
              )}
            >
              Action
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="hidden" />
            <DropdownMenuItem
              className="flex text-white hover:bg-[#101010] hover:border hover:border-[#ff6913] focus:text-white items-center justify-center gap-2 px-3 py-4"
              onClick={async () => {
                await signOut();
                router.push("/sign-in");
              }}
            >
              <RiLogoutCircleFill />
              <span
                className={cn(
                  paragraphVariants({ size: "small", weight: "medium" }),
                  "hover:text-[#ff6913]"
                )}
              >
                Log Out
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
};

export default HeaderProfile;
