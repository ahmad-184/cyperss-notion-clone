import { getUserSubscriptionAction } from "@/server-actions";
import { redirect } from "next/navigation";
import WorkspacesDropdown from "./WorkspacesDropdown";
import UsagePlan from "./UsagePlan";
import NativeNavigation from "./NativeNavigation";
import { ScrollArea } from "../ui/ScrollArea";
import { validatUser } from "@/lib/validateUser";
import Folders from "../folders";
import UserCard from "../UserCard";
import { cn } from "@/lib/utils";

interface SidebarProps {
  workspaceId: string;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = async ({ workspaceId, className }) => {
  const { validatedUser, error } = await validatUser();
  if (error) return redirect("/signout");
  if (!validatedUser?.id) return redirect("/signout");

  const { data, error: subError } = await getUserSubscriptionAction(
    validatedUser.id
  );

  return (
    <div
      className={cn("bg-white dark:bg-background hidden md:block", className)}
    >
      <ScrollArea className="border-r w-full" type="hover">
        <div className="w-screen sm:w-[280px] h-screen p-3 px-5 sm:px-3 py-4 pb-0 flex flex-col">
          <WorkspacesDropdown user={validatedUser} />
          <UsagePlan subscription={data} />
          <NativeNavigation user={validatedUser} />
          <Folders subscription={data} />
          <div className="flex items-endpt-4 pb-3">
            <UserCard user={validatedUser} subscription={data!} />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
