import { Metadata } from "next";
import SignIn from "./SignIn";
import { getAuthSession } from "@/lib/authOptions";
import { notFound } from "next/navigation";
import AppLogo from "@/components/AppLogo";
import { getDirByLang } from "@/lib/dir";
import { cn } from "@/lib/utils";
import initTranslations from "@/lib/i18n";

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
