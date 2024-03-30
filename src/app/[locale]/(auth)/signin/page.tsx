import { Metadata } from "next";
import SignIn from "./SignIn";
import { getAuthSession } from "@/lib/authOptions";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Cypress - Sign in",
};

export default async function Page() {
  const session = await getAuthSession();

  if (session?.user) return notFound();

  return (
    <div>
      <SignIn />
    </div>
  );
}
