import { ScrollArea } from "../ui/ScrollArea";
import { redirect } from "next/navigation";
import { Subscription } from "@prisma/client";
import CreateFolder from "./CreateFolder";
import FoldersList from "./FoldersList";
import { validatUser } from "@/lib/validateUser";

interface FoldersProps {
  subscription: Subscription | null;
}

const Folders: React.FC<FoldersProps> = async ({ subscription }) => {
  const { validatedUser, error } = await validatUser();
  if (error || !validatedUser) redirect("/signout");

  return (
    <div className="my-3 w-full flex flex-grow flex-col relative md:overflow-auto md:pb-5">
      <CreateFolder user={validatedUser} subscription={subscription} />
      <div className="flex flex-grow flex-col">
        {/* <ScrollArea className="h-full max-h-[250px] pt-0 pb-0 px-0 w-full relative"> */}
        {/* <div className="h-20 pointer-events-none w-full absolute bottom-0 bg-gradient-to-t from-background to-transparent z-40" /> */}
        <FoldersList user={validatedUser} />
        {/* </ScrollArea> */}
      </div>
    </div>
  );
};

export default Folders;
