import DashboardSetup from "@/components/DashboardSetup";
import LanguageChanger from "@/components/LanguageChanger";
import { getAuthSession } from "@/lib/authOptions";
import { db } from "@/lib/db";
import { getUserSubscription } from "@/server-actions";
import { redirect } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default async function Page() {
  const session = await getAuthSession();

  if (!session) return redirect("/signin");
  if (!session.user) return redirect("/signin");

  const existingWorkspace = await db.workspace.findFirst({
    where: {
      workspaceOwnerId: session.user.id!,
    },
  });

  const { data, error } = await getUserSubscription(session.user.id as string);

  if (!existingWorkspace)
    return (
      <div className="w-full relative h-screen flex items-center justify-center">
        <div className="absolute top-4 rtl:left-6 ltr:right-6 flex items-center gap-2">
          <ThemeToggle />
          <LanguageChanger />
        </div>
        <DashboardSetup user={session.user} subscription={data} />
      </div>
    );

  return redirect(`/dashboard/${existingWorkspace.id}`);
}
