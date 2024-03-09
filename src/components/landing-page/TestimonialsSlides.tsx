import { USERS } from "@/constants";
import { cn } from "@/lib/utils";
import CustomCard from "./CustomCard";
import { Avatar } from "../ui/avatar";
import Image from "next/image";
import { CardDescription, CardTitle } from "../ui/Card";

const TestimonialsSlides = () => {
  return (
    <>
      {[...Array(2)].map((arr, i) => (
        <div
          className={cn(
            "mt-10 flex flex-nowrap gap-6 self-start",
            {
              "flex-row-reverse": i === 0,
              "animate-[slide_250s_linear_infinite]": true,
              "animate-[slide_250s_linear_infinite_reverse]": i === 1,
              "ml-[100vw]": i === 1,
            },
            "hover:paused"
          )}
          key={arr + i}
        >
          {USERS.map((user, i) => (
            <CustomCard
              className="w-[300px] sm:w-[500px] shrink-0 rounded-xl bg-gradient-to-t from-border to-background"
              cardHeader={
                <div className="items-center flex gap-4">
                  <Avatar>
                    <div className="relative w-full h-full rounded-full">
                      <Image
                        alt={`testimonial ${user.name}`}
                        src={user.avatar}
                        className="object-contain"
                      />
                    </div>
                  </Avatar>
                  <div>
                    <CardTitle className="text-foreground">
                      {user.name}
                    </CardTitle>
                    <CardDescription className="dark:text-zinc-400">
                      {user.name.toLocaleLowerCase()}
                    </CardDescription>
                  </div>
                </div>
              }
              cardContent={<p className="dark:text-zinc-400">{user.message}</p>}
            />
          ))}
        </div>
      ))}
    </>
  );
};

export default TestimonialsSlides;
