import { Metadata } from "next";
import SignIn from "./SignIn";
import { getAuthSession } from "@/lib/authOptions";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Cypress - Sign in",
};

interface PageProps {
  params: { locale: string };
}

export default async function Page({ params }: PageProps) {
  const session = await getAuthSession();

  if (session?.user) return notFound();

  return (
    <div>
      <SignIn locale={params.locale} />
    </div>
  );
}
