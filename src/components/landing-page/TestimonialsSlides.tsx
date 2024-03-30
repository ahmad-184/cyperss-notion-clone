import { USERS } from "@/constants";
import { cn } from "@/lib/utils";
import CustomCard from "./CustomCard";
import { Avatar } from "../ui/Avatar";
import Image from "next/image";
import { CardDescription, CardTitle } from "../ui/Card";

import type { TFunction } from "i18next";

const TestimonialsSlides = ({ t, lang }: { t: TFunction; lang: string }) => {
  return (
    <>
      {[...Array(2)].map((arr, i) => (
        <div
          className={cn(
            "mt-10 flex flex-nowrap gap-6 self-start",
            {
              "flex-row-reverse": i === 0,
              "animate-[slide_250s_linear_infinite]": lang === "en",
              "animate-[slide-rtl_250s_linear_infinite]": lang !== "en",
              "animate-[slide_250s_linear_infinite_reverse]":
                i === 1 && lang === "en",
              "animate-[slide-rtl_250s_linear_infinite_reverse]":
                i === 1 && lang !== "en",
              "ml-[100vw]": i === 1,
            },
            "hover:paused"
          )}
          key={
            arr +
            i +
            new Date().getFullYear() +
            new Date().getTime() +
            Math.random() * 100000000
          }
        >
          {USERS.map((user, i) => (
            <CustomCard
              key={
                i +
                new Date().getFullYear() +
                new Date().getMinutes() +
                Math.random() * 100000000
              }
              className="w-[300px] sm:w-[500px] shrink-0 rounded-xl bg-gradient-to-t from-border to-background"
              cardHeader={
                <div className="items-center flex gap-4">
                  <Avatar>
                    <div className="relative w-full h-full rounded-full">
                      <Image
                        alt={`trusted by ${user.name}`}
                        src={user.avatar}
                        className="object-contain"
                      />
                    </div>
                  </Avatar>
                  <div>
                    <CardTitle className="text-foreground">
                      {t(`trusted-by:trustedby-${user.name}-name`)}
                    </CardTitle>
                    <CardDescription className="dark:text-zinc-400">
                      {t(
                        `trusted-by:trustedby-${user.name}-name`
                      ).toLocaleLowerCase()}
                    </CardDescription>
                  </div>
                </div>
              }
              cardContent={
                <p className="dark:text-zinc-400">
                  {t(`trusted-by:trustedby-message`)}
                </p>
              }
            />
          ))}
        </div>
      ))}
    </>
  );
};

export default TestimonialsSlides;
