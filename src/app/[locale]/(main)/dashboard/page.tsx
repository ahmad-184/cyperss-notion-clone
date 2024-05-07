import DashboardSetup from "@/components/DashboardSetup";
import LanguageChanger from "@/components/LanguageChanger";
import { db } from "@/lib/db";
import { getUserSubscription } from "@/server-actions";
import { redirect } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import RedirectUser from "./RedirectUser";
import { validatUser } from "@/lib/validateUser";

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function Page({ params }: PageProps) {
  const { validatedUser, error } = await validatUser();
  if (error) return redirect("/signout");
  if (!validatedUser?.id) return redirect("/signout");

  const existingWorkspace = await db.workspace.findFirst({
    where: {
      workspaceOwnerId: validatedUser.id as string,
    },
  });

  const { data } = await getUserSubscription(validatedUser.id as string);

  if (!existingWorkspace)
    return (
      <div className="w-full relative h-screen flex items-center justify-center">
        <div className="absolute top-4 rtl:left-6 ltr:right-6 flex items-center gap-2">
          <ThemeToggle />
          <LanguageChanger />
        </div>
        <DashboardSetup
          user={validatedUser}
          subscription={data}
          locale={params.locale}
        />
      </div>
    );

  return <RedirectUser id={existingWorkspace.id} user={validatedUser} />;
}
