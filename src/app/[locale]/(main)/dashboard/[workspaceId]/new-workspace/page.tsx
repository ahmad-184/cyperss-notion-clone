import { validatUser } from "@/lib/validateUser";
import NewWorkspace from "./NewWorkspace";
import { getUserSubscriptionAction } from "@/server-actions";

interface PageProps {
  params: {
    locale: string;
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const { validatedUser, error } = await validatUser();
  if (error || !validatedUser) return;
  if (!validatedUser.id) return;

  const { data: subscription } = await getUserSubscriptionAction(
    validatedUser.id
  );

  return (
    <>
      <NewWorkspace
        first_setup={false}
        locale={params.locale}
        subscription={subscription}
        user={validatedUser}
      />
    </>
  );
};

export default Page;
