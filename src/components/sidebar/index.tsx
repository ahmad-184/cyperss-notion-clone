import { getAuthSession } from "@/lib/authOptions";
import { getUserSubscription } from "@/server-actions";
import { notFound } from "next/navigation";
import WorkspacesDropdown from "./WorkspacesDropdown";

interface SidebarProps {
  workspaceId: string;
}

const Sidebar: React.FC<SidebarProps> = async ({ workspaceId }) => {
  const session = await getAuthSession();

  if (!session?.user) return notFound();
  if (!session?.user.id) return notFound();

  const { data } = await getUserSubscription(session.user.id);

  return (
    <div className="w-[280px] border-r h-screen p-3 py-4">
      <WorkspacesDropdown />
    </div>
  );
};

export default Sidebar;
