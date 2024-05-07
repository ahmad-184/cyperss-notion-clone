import { cn } from "@/lib/utils";
import { User } from "@/types";
import CustomAvatar from "../custom/CustomAvatar";
import { Minus, Plus } from "lucide-react";
import { useMemo } from "react";

interface CollaboratorProps {
  data: User;
  onChangeValue: (u: User) => void;
  isActive: boolean;
}

const Collaborator: React.FC<CollaboratorProps> = ({
  onChangeValue,
  data,
  isActive,
}) => {
  const active = useMemo(() => isActive, [isActive]);

  return (
    <div
      className={cn(
        "flex px-3 shadow-sm dark:shadow-none bg-muted/40 hover:bg-muted/60 transition-color duration-150 cursor-pointer rounded-md p-2 justify-between gap-3 items-center",
        {
          "bg-primary/90 shadow-none hover:bg-primary/80 dark:bg-primary/70 dark:hover:bg-primary/50":
            active,
        }
      )}
      key={data.id + `${Math.random() * 10000}`}
      onClick={() => onChangeValue(data)}
    >
      <div className="flex gap-3 items-center">
        <CustomAvatar user={data} />
        <div className="flex flex-col">
          <p
            className={cn("dark:text-slate-300 text-sm", {
              "text-slate-100": active,
            })}
          >
            {data?.name}
          </p>
          <small
            className={cn("text-muted-foreground", {
              "dark:text-slate-400 text-slate-300": active,
            })}
          >
            {data?.email}
          </small>
        </div>
      </div>
      <div>
        {active ? (
          <Minus className="w-5 h-5 dark:text-slate-300 text-muted" />
        ) : (
          <Plus className="w-5 h-5 dark:text-slate-300 text-muted-foreground" />
        )}
      </div>
    </div>
  );
};

export default Collaborator;
