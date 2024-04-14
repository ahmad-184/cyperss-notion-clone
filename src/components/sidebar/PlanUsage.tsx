"use client";

import { MAX_FOLDERS_FREE_PLAN } from "@/constants";
import { useAppSelector } from "@/store";
import { subscription as Subscription } from "@prisma/client";
import { useEffect, useState } from "react";
import { Progress } from "../ui/Progress";

interface PlanUsageProps {
  subscription: Subscription | null;
}

const PlanUsage: React.FC<PlanUsageProps> = ({ subscription }) => {
  const workspace = useAppSelector(
    (store) => store.workspace.current_workspace
  );
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
      {subscription?.status !== "active" ? (
        <div className="my-3">
          <div className="w-full flex flex-col gap-2">
            <div className="w-full flex justify-between gap-5 text-muted-foreground">
              <small>Free Plan</small>
              <small>{usagePercentage}% / 100%</small>
            </div>
            <Progress
              value={usagePercentage}
              className="h-1 bg-muted-foreground dark:bg-muted"
              indicatorStyle="bg-primary"
            />
          </div>
        </div>
      ) : null}
    </>
  );
};

export default PlanUsage;
