"use client";

import { Button } from "@/components/ui/Button";
import Image from "next/image";

import Logo from "@/assets/cypresslogo.svg";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  err,
  reset,
}: {
  err: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.log(err);
  }, [err]);

  return (
    <div className="w-full h-screen flex items-center justify-center relative px-4 sm:px-4 py-6 bg-gradient-to-bl from-background to-purple-500/20">
      <div className="absolute top-6 left-4 sm:left-12">
        <Link href="/" className="flex gap-2 items-center">
          <Image alt="Cypress logo" src={Logo} width={25} height={25} />
          <p className="dark:text-slate-200 font-medium">cypress.</p>
        </Link>
      </div>
      <div className="flex flex-col gap-4 text-center justify-center items-center">
        <h1>
          <span className="text-3xl sm:text-5xl font-semibold text-slate-700 dark:text-slate-200">
            Ooooops, getting errors
          </span>
          <span className="text-3xl sm:text-5xl font-semibold">🪲🤧</span>
        </h1>
        <p className="">We catch some errors, reset to fix</p>
        <Button
          variant="secondary"
          className="bg-slate-200 dark:bg-slate-700"
          onClick={reset}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
