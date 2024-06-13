import { getUsersAction } from "@/server-actions";
import { User } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Label } from "../ui/Label";
import { ChevronDown } from "lucide-react";
import { ScrollArea } from "../ui/ScrollArea";
import { cn } from "@/lib/utils";
import Loader from "../Loader";
import Collaborator from "./Collaborator";
import { useTranslation } from "react-i18next";

interface SelectCollaboratorsProps {
  getValue(data: User[] | []): void;
  selectedCollaborators: User[] | [];
}

const SelectCollaborators: React.FC<SelectCollaboratorsProps> = ({
  getValue,
  selectedCollaborators,
}) => {
  const [users, seUsers] = useState<User[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (!openDropdown) return;
    const fetchUser = async () => {
      try {
        setLoading(true);
        const { error, data } = await getUsersAction(false);
        if (error) {
          toast.error(t("dashboard:error-message"));
          return;
        }
        if (data?.length) seUsers(data);
      } catch (err: any) {
        toast.error(t("dashboard:error-message"));
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [openDropdown]);

  const onChangeValue = (data: User) => {
    const isUserExist = selectedCollaborators.find((c) => c.id === data.id);
    if (isUserExist) {
      const removeUser = selectedCollaborators.filter((e) => e.id !== data.id);
      getValue(removeUser);
    } else {
      const allSelected = [...selectedCollaborators, { ...data }];
      getValue(allSelected);
    }
  };

  return (
    <div className="w-full relative">
      <div className="flex w-full flex-col gap-1 z-10">
        <Label>{t("dashboard:collaborators")}</Label>
        <div
          onClick={() => setOpenDropdown((prev) => !prev)}
          className="w-full px-3 py-1 flex cursor-pointer items-center rounded-md border dark:border-slate-800"
        >
          <div className="flex gap-2 flex-grow flex-row flex-wrap py-2">
            {!selectedCollaborators.length && (
              <p className="text-sm text-muted-foreground">
                {t("dashboard:select")}
              </p>
            )}
            {selectedCollaborators.length
              ? selectedCollaborators.map((e) => (
                  <div
                    key={e.id + `${e.id}` + e.name}
                    id={`collaborator:${e.id}`}
                    className={cn(
                      "p-2 px-3 max-w-24 truncate overflow-hidden  dark:bg-muted-foreground/40 bg-slate-200 rounded-lg"
                    )}
                  >
                    <small className=" dark:text-slate-400">{e.name}</small>
                  </div>
                ))
              : null}
          </div>
          <div>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </div>
        </div>
      </div>
      <ScrollArea
        className={cn(
          "w-full flex-col transition-all duration-150 dark:bg-black/30 rounded-md border dark:border-slate-800",
          {
            "invisible h-0": !openDropdown,
            "px-3 py-3 mt-2": openDropdown,
            "h-[174px]": !isLoading && openDropdown,
            "h-[55px]": isLoading && openDropdown,
          }
        )}
      >
        {isLoading && openDropdown ? (
          <div className="w-full flex h-full justify-center items-center">
            <Loader className="w-7 h-7 flex items-center justify-center" />
          </div>
        ) : null}
        {!isLoading && openDropdown ? (
          <div className="flex flex-col gap-2 w-full py-1">
            {users.length
              ? users.map((u, i) => (
                  <Collaborator
                    data={u}
                    key={i + u.id!}
                    onChangeValue={onChangeValue}
                    isActive={selectedCollaborators.some((e) => e.id === u.id)}
                  />
                ))
              : null}
          </div>
        ) : null}
      </ScrollArea>
    </div>
  );
};

export default SelectCollaborators;
