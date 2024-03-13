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
    <div className="w-full h-screen flex items-center justify-center relative px-4 sm:px-4 py-6">
      <div className="flex gap-2 absolute top-6 left-4 sm:left-6">
        <Link href="/">
          <Image alt="Cypress logo" src={Logo} width={25} height={25} />
        </Link>
        <p className="dark:text-slate-200">cypress.</p>
      </div>
      <div className="flex flex-col gap-4 text-center justify-center items-center">
        <h1>
          <span className="text-3xl sm:text-6xl font-semibold text-transparent bg-clip-text bg-gradient-to-l from-rose-500 to-purple-300">
            Ooooops, getting errors
          </span>
          <span className="text-3xl sm:text-6xl font-semibold">🤧</span>
        </h1>
        <p className="">We catch some errors, reset to fix</p>
        <Button variant="secondary" onClick={reset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
