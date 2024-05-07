"use client";

import { MAX_FOLDERS_FREE_PLAN } from "@/constants";
import { useAppSelector } from "@/store";
import { Subscription } from "@prisma/client";
import { useEffect, useState } from "react";
import { Progress } from "../ui/Progress";
import CypressDiamondIcon from "../icons/DiamondIcon";
import { Skeleton } from "../ui/Skeleton";

interface UsagePlanProps {
  subscription: Subscription | null;
}

const UsagePlan: React.FC<UsagePlanProps> = ({ subscription }) => {
  const workspace = useAppSelector(
    (store) => store.workspace.current_workspace
  );
  const loading = useAppSelector((store) => store.workspace.loading);
  const [usagePercentage, setUsagePercentage] = useState<number>(
    Number(
      workspace?.folders
        ? (workspace?.folders?.length / MAX_FOLDERS_FREE_PLAN) * 100
        : 0
    )
  );

  useEffect(() => {
    setUsagePercentage(
      Number(
        workspace?.folders
          ? (workspace?.folders?.length / MAX_FOLDERS_FREE_PLAN) * 100
          : 0
      )
    );
  }, [workspace?.folders]);

  return (
    <>
      {loading ? (
        <div className="my-3">
          <div className="w-full flex flex-col gap-2">
            <div className="w-full flex justify-between gap-5">
              <Skeleton className="w-14 h-2" />
              <Skeleton className="w-14 h-2" />
            </div>
            <Skeleton className="w-full h-2" />
          </div>
        </div>
      ) : (
        <>
          {subscription?.status !== "active" ? (
            <div className="my-3">
              <div className="w-full flex flex-col gap-2">
                <div className="w-full flex justify-between gap-5 dark:text-gray-500">
                  <div className="flex items-center gap-1">
                    <CypressDiamondIcon className="w-4 h-4" />
                    <small>Free Plan</small>
                  </div>
                  <small>{usagePercentage.toFixed()}% / 100%</small>
                </div>
                <Progress
                  value={usagePercentage}
                  className="h-1 bg-gray-200 dark:bg-muted"
                  indicatorStyle="bg-primary"
                />
              </div>
            </div>
          ) : null}
        </>
      )}
    </>
  );
};

export default UsagePlan;
