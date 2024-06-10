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
import ConnectionStatus from "./ConnectionStatus";
import { getDirByLang } from "@/lib/dir";

interface SidebarProps {
  workspaceId: string;
  className?: string;
  locale: string;
}

const Sidebar: React.FC<SidebarProps> = async ({
  workspaceId,
  className,
  locale,
}) => {
  const { validatedUser, error } = await validatUser();
  if (error) return redirect("/signout");
  if (!validatedUser?.id) return redirect("/signout");

  const { data } = await getUserSubscriptionAction(validatedUser.id);

  return (
    <div
      className={cn("bg-white dark:bg-background hidden md:block", className)}
    >
      <ScrollArea className="ltr:border-r rtl:border-l w-full" type="hover">
        <div
          dir={getDirByLang(locale)}
          className="w-screen sm:w-[280px] h-screen p-3 px-5 sm:px-3 py-4 pb-0 flex flex-col"
        >
          <WorkspacesDropdown user={validatedUser} />
          {/* <UsagePlan subscription={data} /> */}
          <ConnectionStatus />
          {/* <hr /> */}
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
