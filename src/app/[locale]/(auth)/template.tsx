import Link from "next/link";
import logo from "@/assets/cypresslogo.svg";
import Image from "next/image";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-full justify-center flex items-center">
      <div className="w-full max-w-sm p-6 flex flex-col gap-2">
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex gap-3 items-center">
            <Link href={"/"} className="relative">
              <Image
                src={logo}
                width={50}
                height={50}
                className="w-9"
                alt="Cypress Logo"
              />
            </Link>
            <h1 className="text-3xl font-semibold dark:text-slate-200">
              Cypress.
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            An all-in-one Collaboration and Productivity Platform.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
