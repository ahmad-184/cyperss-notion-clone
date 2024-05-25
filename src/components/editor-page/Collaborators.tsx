import { useAppSelector } from "@/store";
import CustomAvatar from "../custom/CustomAvatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/Tooltip";

interface CollaboratorsProps {}

const Collaborators: React.FC<CollaboratorsProps> = () => {
  const { current_workspace } = useAppSelector((store) => store.workspace);

  return (
    <div className="flex">
      {current_workspace?.type === "shared" ? (
        <>
          {current_workspace.collaborators.map((c, i) => (
            <div className="-ml-3" key={c.user.id}>
              <Tooltip>
                <TooltipTrigger>
                  <CustomAvatar
                    className="border-2 w-9 h-9 border-gray-600 dark:border-gray-500"
                    user={c.user}
                  />
                </TooltipTrigger>
                <TooltipContent>{c.user.name}</TooltipContent>
              </Tooltip>
            </div>
          ))}
        </>
      ) : null}
    </div>
  );
};

export default Collaborators;
