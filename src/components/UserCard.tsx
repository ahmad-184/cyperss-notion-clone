"use client";

import { User } from "@/types";
import { Subscription } from "@prisma/client";
import CustomAvatar from "./custom/CustomAvatar";
import { LogOutIcon, Zap } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAppSelector } from "@/store";
import { Skeleton } from "./ui/Skeleton";
import CustomDialog from "./custom/CustomDialog";
import { Button } from "./ui/Button";
import { ExternalLink } from "lucide-react";
import { signOut } from "next-auth/react";
import CustomTooltip from "./custom/CustomTooltip";

interface UserCardProps {
  user: User;
  subscription: Subscription;
}

const UserCard: React.FC<UserCardProps> = ({ user, subscription }) => {
  const loading = useAppSelector((store) => store.workspace.loading);

  if (loading)
    return (
      <div className="w-full rounded-xl bg-muted/60 dark:bg-muted/35 p-2">
        <div className="flex gap-2 items-center">
          <Skeleton className="w-[40px] h-[40px] rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="w-[70px] h-3" />
            <Skeleton className="w-[110px] h-2" />
          </div>
          <div className="flex items-center flex-grow justify-end gap-2">
            <Skeleton className="w-6 h-6" />
            <Skeleton className="w-6 h-6" />
          </div>
        </div>
      </div>
    );

  return (
    <div className="w-full rounded-xl bg-muted/40 dark:bg-muted/40 p-2">
      <div className="flex gap-2 items-center">
        <CustomAvatar user={user} />
        <div className="flex flex-col truncate">
          <CustomTooltip description="Upgrade to Pro">
            <p
              className="flex items-center cursor-pointer hover:text-primary 
            transition-all duration-150 
          hover:underline justify-start gap-[2px] 
        text-gray-500 text-sm 
          capitalize truncate"
            >
              {subscription?.status === "active" ? "Pro Plan" : "Free Plan"}
              {subscription?.status === "active" ? (
                <Zap className="w-[0.80rem] h-[0.80rem] relative text-primary bottom-[3px]" />
              ) : (
                <ExternalLink className="w-[0.80rem] h-[0.80rem] relative bottom-[3px]" />
              )}
            </p>
          </CustomTooltip>
          <small className="dark:text-gray-400 text-gray-700 truncate">
            {user.email}
          </small>
        </div>
        <div className="flex items-center flex-grow justify-end gap-2 dark:text-gray-400 text-gray-600">
          <ThemeToggle
            btn_variant="ghost"
            className="bg-transparent hover:bg-transparent w-[1.5rem]"
          />
          <CustomDialog
            header="Are you sure?"
            description={`Before doing enything make sure about your decision.`}
            content={
              <div className="flex w-full justify-end gap-3">
                <Button
                  variant={"destructive"}
                  className="w-full"
                  onClick={() => {
                    signOut({ redirect: false, callbackUrl: "/" }).then(() => {
                      window.localStorage.removeItem("active_workspace");
                      window.location.replace("/");
                    });
                  }}
                >
                  Sign out
                </Button>
              </div>
            }
          >
            <div className="w-[1.5rem]">
              <LogOutIcon className="h-[1.3rem] w-[1.3rem] cursor-pointer" />
            </div>
          </CustomDialog>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
