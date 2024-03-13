"use client";

import { Button, buttonVariants } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="flex flex-col gap-3 text-center">
        <h1 className="text-8xl sm:text-9xl font-bold text-slate-800 dark:text-slate-200">
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
            })}
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
