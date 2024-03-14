"use client";

import { Button, buttonVariants } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Logo from "@/assets/cypresslogo.svg";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="w-full h-screen flex items-center justify-center relative bg-gradient-to-bl from-background to-purple-500/20">
      <div className="absolute top-6 left-4 sm:left-12">
        <Link href="/" className="flex gap-2 items-center">
          <Image alt="Cypress logo" src={Logo} width={25} height={25} />
          <p className="dark:text-slate-200 font-medium">cypress.</p>
        </Link>
      </div>
      <div className="flex flex-col gap-3 text-center">
        <h1 className="text-8xl sm:text-9xl font-bold text-slate-700 dark:text-slate-300">
          404
        </h1>
        <p className="font-normal ">Page you looking for not founded</p>
        <div className="flex gap-2 justify-center">
          <Button
            variant="link"
            onClick={() => router.back()}
            className="text-slate-800 dark:text-slate-300"
          >
            Back
          </Button>
          <Link
            href={"/"}
            className={buttonVariants({
              variant: "secondary",
              className: "bg-slate-200 dark:bg-slate-700",
            })}
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
