import { getUserSubscription } from "@/server-actions";
import { redirect } from "next/navigation";
import WorkspacesDropdown from "./WorkspacesDropdown";
import UsagePlan from "./UsagePlan";
import NativeNavigation from "./NativeNavigation";
import { ScrollArea } from "../ui/ScrollArea";
import { validatUser } from "@/lib/validateUser";
import Folders from "../folders";
import UserCard from "../UserCard";

interface SidebarProps {
  workspaceId: string;
}

const Sidebar: React.FC<SidebarProps> = async ({ workspaceId }) => {
  const { validatedUser, error } = await validatUser();
  if (error) return redirect("/signout");
  if (!validatedUser?.id) return redirect("/signout");

  const { data, error: subError } = await getUserSubscription(validatedUser.id);

  return (
    <div className="fixed top-0 bottom-0 left-0 bg-white dark:bg-background hidden md:block">
      <ScrollArea className="border-r">
        <div className="w-[280px] h-screen p-3 py-4 pb-0 flex flex-col">
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
