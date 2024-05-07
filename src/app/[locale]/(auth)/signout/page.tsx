import { getAuthSession } from "@/lib/authOptions";
import SignOut from "./SignOut";
import { redirect } from "next/navigation";

interface PageProps {
  params: { locale: string };
}

const Page = async ({ params }: PageProps) => {
  const session = await getAuthSession();

  if (!session?.user.id) redirect("/");

  return <SignOut />;
};

export default Page;
