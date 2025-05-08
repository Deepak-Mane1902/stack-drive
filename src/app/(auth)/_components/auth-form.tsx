"use client";


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { P, paragraphVariants } from "@/components/ui/custom/p";
import Link from "next/link";
import { RiGoogleFill, RiLoader3Fill } from "@remixicon/react";
import { authClient } from "@/lib/better-auth/auth-client";
import { toast } from "sonner"; 
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  action: "Sign In" | "Sign Up";
}

const AuthForm = ({ action }: Props) => {
     const [isLoading, setIsLoading] = useState(false);
  return (
    <Card className="w-96 drop-shadow-2xl bg-white shadow-[#1d1d1d]">
      <CardHeader>
        <CardTitle className={paragraphVariants({ size: "large", weight: "bold" })}>
          {action}
        </CardTitle>
        <CardDescription className="text-[#383838]">{action} to access your account</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 ">
        <Button
          variant="outline"
          className="w-auto cursor-pointer text-[c2c2c2] hover:bg-[#1d1d1d] hover:border-[#ff6913] hover:text-[#ff6913] bg-primary rounded-2xl justify-start gap-2 mt-[-10] px-2"
          disabled={isLoading}
          onClick={async () => {
            await authClient.signIn.social(
              {
                provider: "google",
                callbackURL: "/dashboard",
              },
              {
                onSuccess: () => {
                  toast("Success", {
                    description: "Redirecting to Google Sign In Page.",
                    className: "bg-black text-white",
                    descriptionClassName: "text-[#000]",
                  });
                },
                
                onError: (e) => {
                  toast.error("Error", {
                    description: e.error.message,
                    descriptionClassName: "text-[#000]",
                  });
                },
                onRequest: ()=>{
                    setIsLoading(true)
                },
                onResponse:()=>{
                    setIsLoading(false)
                }
              }
            );
          }}
        >
          {!isLoading?<RiGoogleFill />:<RiLoader3Fill className="animate-spin"/>}
          {action} with Google
        </Button> 

        <P variant="muted" size="small" weight="light" className="w-full text-left pl-2 pt-1 text-[#1d1d1d]">
          {action === "Sign In" ? (
            <div className="text-[#383838] font-bold">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="link hover:text-blue-700 text-rose-700 font-semibold hover:underline">
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="text-[#383838] font-bold">
              Already have an account?{" "}
              <Link href="/sign-in"  className="link hover:text-blue-700 text-rose-700 font-semibold hover:underline ">
                Sign In
              </Link>
            </div>
          )}
        </P>
      </CardContent>
    </Card>
  );
};

export default AuthForm;