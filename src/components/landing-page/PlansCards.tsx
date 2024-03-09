import { PRICING_CARDS, PRICING_PLANS } from "@/constants";
import CustomCard from "./CustomCard";
import { cn } from "@/lib/utils";
import { CardContent, CardTitle } from "../ui/Card";
import Image from "next/image";
import { Button } from "../ui/Button";
import Diamond from "@/assets/diamond.svg";
import Check from "@/assets/check.svg";

const PlansCards = () => {
  return (
    <div className="flex flex-col-reverse sm:flex-row gap-4 justify-center sm:items-stretch items-center mt-10">
      {PRICING_CARDS.map((card, i) => (
        <CustomCard
          key={card.planType + i}
          className={cn(
            "w-[300px] rounded-2xl dark:bg-black/95 backdrop-blur-3xl relative",
            {
              "border-purple-500/70": card.planType === PRICING_PLANS.proplan,
            }
          )}
          cardHeader={
            <CardTitle className="text-2xl font-semibold">
              {card.planType === PRICING_PLANS.proplan ? (
                <>
                  <div className="block w-full blur-[120px] rounded-full h-32 absolute dark:bg-purple-600 bg-purple-400 -z-10 top-0" />
                  <Image
                    alt="pro plane"
                    src={Diamond}
                    className="absolute top-6 right-6"
                  />
                </>
              ) : (
                <></>
              )}
              {card.planType}
            </CardTitle>
          }
          cardContent={
            <CardContent className="p-0">
              <span className="font-normal text-2xl">${card.price}</span>
              {+card.price > 0 ? (
                <span className="dark:text-zinc-400 ml-1">/mo</span>
              ) : null}
              <p className="dark:text-zinc-400 ml-1">{card.description}</p>
              <div
                className={cn("mt-4", {
                  "p-[1.5px] rounded-[13px] bg-gradient-to-r from-purple-500 to-blue-500 t":
                    card.planType === PRICING_PLANS.proplan,
                })}
              >
                <Button
                  className={cn(
                    "whitespace-nowrap transition-all duration-150 w-full bg-gradient-to-t border rounded-xl from-border text-black dark:text-white to-background",
                    {
                      "hover:shadow-inner hover:shadow-slate-300 hover:dark:shadow-none hover:dark:opacity-85":
                        card.planType === PRICING_PLANS.freeplan,
                      "hover:opacity-85":
                        card.planType === PRICING_PLANS.proplan,
                    }
                  )}
                >
                  {card.planType === PRICING_PLANS.proplan
                    ? "Go Pro"
                    : "Get Started"}
                </Button>
              </div>
            </CardContent>
          }
          cardFooter={
            <ul className="font-normal flex mb-2 flex-col gap-4">
              <small>{card.highlightFeature}</small>
              {card.freatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Image src={Check} alt={feature} />
                  {feature}
                </li>
              ))}
            </ul>
          }
        />
      ))}
    </div>
  );
};

export default PlansCards;
