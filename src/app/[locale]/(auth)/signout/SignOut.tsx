"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { LoaderCircle, ShieldAlert } from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect } from "react";

interface SignOutProps {}

const SignOut: React.FC<SignOutProps> = ({}) => {
  useEffect(() => {
    if (window) {
      setTimeout(() => {
        signOut({ redirect: false, callbackUrl: "/" }).then(() => {
          window.localStorage.removeItem("active_workspace");
          window.location.replace("/");
        });
      }, 2500);
    }
  }, []);

  return (
    <div className="flex items-center justify-center">
      <Alert variant={"destructive"}>
        <ShieldAlert className="w-5 h-5" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="flex items-center">
          Your access denied, Signing out...{" "}
          <LoaderCircle
            className="ml-2 animate-spin w-4 h-4"
            strokeWidth="3px"
          />
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SignOut;
