"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import CypressLogo from "@/components/CypressLogo";
import { getWorkspaceByIdAction } from "@/server-actions";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { User } from "@/types";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

interface RedirectUserProps {
  id: string;
  user: User;
}

const RedirectUser: React.FC<RedirectUserProps> = ({ id, user }) => {
  const router = useRouter();
  const [error, setError] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      if (!window) return;
      const active_workspace = window.localStorage.getItem(
        "active_workspace"
      ) as string;
      if (!active_workspace) return router.push(`dashboard/${id}`);
      const { data, error } = await getWorkspaceByIdAction(active_workspace);
      if (error) {
        return setError(true);
      }
      if (data?.id) return router.push(`dashboard/${data.id}`);
      else {
        window.localStorage.removeItem("active_workspace");
        return router.push(`dashboard/${id}`);
      }
    })();
  }, []);

  const fixError = () => {
    if (window) {
      window.localStorage.removeItem("active_workspace");
      window.location.reload();
    }
  };

  return (
    <>
      <main className="flex items-center justify-center select-none fixed w-full h-full inset-0 dark:bg-background">
        <div className="absolute animate-pulse inset-0 w-full h-full z-[1] bg-cover bg-repeat background-cover" />
        <div className="p-2 flex flex-col gap-4 items-center z-[2]">
          <CypressLogo width={60} height={60} className="animate-pulse" />
          <p className="text-4xl font-medium text-foreground animate-pulse capitalize">
            {t("common:cypress")}
          </p>
          {error ? (
            <>
              <Alert>
                <ShieldAlert className="w-6 h-6" />
                <AlertTitle>{t("dashboard:getting-error")}</AlertTitle>
                <AlertDescription>
                  {t("dashboard:getting-error-desc")}
                </AlertDescription>
              </Alert>
              <Button className="w-full" onClick={fixError}>
                {t("dashboard:fix-error")}
              </Button>
            </>
          ) : null}
        </div>
      </main>
    </>
  );
};

export default RedirectUser;
