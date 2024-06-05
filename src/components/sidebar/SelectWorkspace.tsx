import { WorkspaceTypes } from "@/types";
import Image from "next/image";
import Logo from "@/assets/cypresslogo.svg";
import { cn } from "@/lib/utils";
import { Workspace } from "@prisma/client";

interface SelectWorkspaceProps extends React.HTMLAttributes<HTMLDivElement> {
  selectWorkspace: () => void;
  workspace: Workspace;
  image_size?: number;
  endIcon?: React.ReactNode;
}

const SelectWorkspace: React.FC<SelectWorkspaceProps> = ({
  selectWorkspace,
  workspace,
  className,
  image_size,
  endIcon,
}) => {
  return (
    <div
      onClick={selectWorkspace}
      className={cn(
        `w-full 
      bg-muted/50 
      cursor-pointer 
      transition-all 
      duration-150
       hover:bg-muted
       select-none
    p-2 flex justify-start gap-4 my-1 items-center rounded-md`,
        className
      )}
    >
      <Image
        src={workspace?.logo || Logo}
        width={image_size || 25}
        height={image_size || 25}
        alt="workspace logo"
        className="object-cover"
      />
      <p
        className={`whitespace-nowrap truncate overflow-hidden overflow-ellipsis
        capitalize max-w-[206px]
      `}
      >
        {workspace?.title || "Untitled"}
      </p>
      {endIcon ? (
        <div className="flex justify-end flex-grow h-full items-center">
          {endIcon}
        </div>
      ) : null}
    </div>
  );
};

export default SelectWorkspace;
