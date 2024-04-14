import { WorkspaceTypes } from "@/types";
import Image from "next/image";
import Logo from "@/assets/cypresslogo.svg";
import { cn } from "@/lib/utils";

interface SelectWorkspaceProps extends React.HTMLAttributes<HTMLDivElement> {
  selectWorkspace(): void;
  workspace: WorkspaceTypes;
  image_size?: number;
}

const SelectWorkspace: React.FC<SelectWorkspaceProps> = ({
  selectWorkspace,
  workspace,
  className,
  image_size,
}) => {
  return (
    <div
      onClick={() => selectWorkspace()}
      className={cn(
        `w-full 
      bg-muted/50 
      cursor-pointer 
      transition-all 
      duration-150
       hover:bg-muted
    p-2 flex gap-4 my-1 items-center rounded-md`,
        className
      )}
    >
      <Image
        src={workspace?.logo ? workspace.logo : Logo}
        width={image_size || 25}
        height={image_size || 25}
        alt="workspace logo"
        className="object-cover"
      />
      <p
        className={`whitespace-nowrap truncate overflow-hidden overflow-ellipsis
        capitalize
      `}
      >
        {workspace?.title}
      </p>
    </div>
  );
};

export default SelectWorkspace;
