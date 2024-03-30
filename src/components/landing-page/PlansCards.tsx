import { PRICING_CARDS, PRICING_PLANS } from "@/constants";
import CustomCard from "./CustomCard";
import { cn } from "@/lib/utils";
import { CardContent, CardTitle } from "../ui/Card";
import Image from "next/image";
import { Button } from "../ui/Button";
import Diamond from "@/assets/diamond.svg";
import Check from "@/assets/check.svg";
import { TFunction } from "i18next";

const PlansCards = ({ t, lang }: { t: TFunction; lang: string }) => {
  return (
    <div className="flex flex-col-reverse sm:flex-row gap-4 justify-center sm:items-stretch items-center mt-10">
      {PRICING_CARDS.map((card, i) => {
        const plan = card.planType;

        return (
          <CustomCard
            key={
              card.planType +
              i +
              new Date().getFullYear() +
              new Date().getTime() +
              Math.floor(Math.random() * 100000000)
            }
            className={cn(
              "w-[300px] rounded-2xl dark:bg-black/95 backdrop-blur-3xl relative",
              {
                "border-purple-500/70": card.planType === PRICING_PLANS.proplan,
              }
            )}
            cardHeader={
              <CardTitle className="text-2xl font-semibold flex justify-between">
                {t(`${plan}:plan-type`)}
                {card.planType === PRICING_PLANS.proplan ? (
                  <>
                    <div className="block w-full blur-[120px] rounded-full h-32 absolute dark:bg-purple-600 bg-purple-400 -z-10 top-0" />
                    <Image alt="pro plane" src={Diamond} />
                  </>
                ) : (
                  <></>
                )}
              </CardTitle>
            }
            cardContent={
              <CardContent className="p-0">
                <span className="font-normal text-2xl">
                  ${t(`${plan}:price`)}
                </span>
                {+card.price > 0 ? (
                  <span className="dark:text-slate-400 text-sm mr-[2px]">
                    /{t(`${plan}:subscription-time`)}
                  </span>
                ) : null}
                <p className="dark:text-slate-400 ml-1 mb-4 text-sm">
                  {t(`${plan}:description`)}
                </p>

                <Button
                  className={cn("w-full", {
                    "mt-[20px]": lang !== "en" && plan === "plan-free",
                  })}
                  variant={"btn-primary"}
                >
                  {card.planType === PRICING_PLANS.proplan
                    ? t("plan-pro:go-pro")
                    : t("common:get-started")}
                </Button>
              </CardContent>
            }
            cardFooter={
              <ul className="font-normal flex mb-2 flex-col gap-4">
                <small className="dark:text-slate-300">
                  {t(`${plan}:highlightFeature`) || null}
                </small>
                {t(`${plan}:freatures`)
                  .split(",")
                  .map((feature, i) => (
                    <li
                      key={
                        feature +
                        i +
                        new Date().getFullYear() +
                        Math.floor(Math.random() * 100000000)
                      }
                      className="flex items-center gap-2"
                    >
                      <Image src={Check} alt={feature} />
                      {feature}
                    </li>
                  ))}
              </ul>
            }
          />
        );
      })}
    </div>
  );
};

export default PlansCards;
