"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { LoaderCircle, ShieldAlert } from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface SignOutProps {}

const SignOut: React.FC<SignOutProps> = ({}) => {
  const { t } = useTranslation();

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
      <Alert variant={"destructive"} className="dark:text-rose-700">
        <ShieldAlert className="w-5 h-5 dark:text-rose-700" />
        <AlertTitle>{t("error:error")}</AlertTitle>
        <AlertDescription className="flex items-center">
          {t("error:access-denied")}{" "}
          <LoaderCircle
            className="ml-2 animate-spin w-4 h-4 "
            strokeWidth="3px"
          />
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SignOut;
