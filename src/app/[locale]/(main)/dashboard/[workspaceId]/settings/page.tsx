import Settings from "@/components/settings";
import { validatUser } from "@/lib/validateUser";
import { getUserSubscriptionAction } from "@/server-actions";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const revalidate = 0;

interface PageProps {
  params: {
    workspaceId: string;
  };
}

export const metadata: Metadata = {
  title: "Settings",
};

const Page = async ({ params }: PageProps) => {
  const { validatedUser, error } = await validatUser();
  if (error || !validatedUser?.id) return redirect("/signout");

  const { data: subscription } = await getUserSubscriptionAction(
    validatedUser.id
  );

  return (
    <div className="p-5 px-3 sm:px-10 flex justify-center workspace-content">
      <Settings
        subscription={subscription!}
        user={validatedUser}
        workspaceId={params.workspaceId}
      />
    </div>
  );
};

export default Page;
