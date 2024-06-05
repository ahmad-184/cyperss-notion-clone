import { useAppSelector } from "@/store";
import CustomAvatar from "../custom/CustomAvatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/Tooltip";
import { cn } from "@/lib/utils";
import { FolderType, User, WorkspaceTypes } from "@/types";
import { File } from "@prisma/client";

interface CollaboratorsProps {
  user: User;
  data: FolderType | WorkspaceTypes | File | null;
  onlineCollaborators: User[];
  setOnlineCollaborators: (u: User[]) => void;
}

const Collaborators: React.FC<CollaboratorsProps> = ({
  onlineCollaborators,
}) => {
  const { current_workspace } = useAppSelector((store) => store.workspace);

  return (
    <div className="flex">
      {current_workspace?.type === "shared" ? (
        <>
          {onlineCollaborators.map((c, i) => (
            <div
              className={cn("my-0 py-0 flex", {
                "-ml-3": i !== 0,
              })}
              key={c.id}
            >
              <Tooltip>
                <TooltipTrigger>
                  <div className="w-9 h-9">
                    <CustomAvatar
                      className="w-full h-full outline-dashed outline-[1.5px] outline-offset-1 outline-green-500 dark:outline-green-400"
                      user={c}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>{c.name}</TooltipContent>
              </Tooltip>
            </div>
          ))}
        </>
      ) : null}
    </div>
  );
};

export default Collaborators;
