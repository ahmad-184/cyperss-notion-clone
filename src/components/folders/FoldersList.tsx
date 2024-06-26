"use client";

import { useAppSelector } from "@/store";
import { Accordion } from "../ui/Accordion";
import DropdownItem from "./DropdownItem";
import { useParams } from "next/navigation";
import { Skeleton } from "../ui/Skeleton";
import { User } from "@/types";
import { useLanguage } from "@/contexts/language-context";
import { getDirByLang } from "@/lib/dir";
import { ScrollArea } from "../ui/ScrollArea";

interface FoldersListProps {
  user: User;
}

const FolderListSkeleton = () => {
  return (
    <div className="mt-4 w-full">
      <div className="mt-3 w-full" key={1}>
        <Skeleton className="w-[65%] h-5 mb-3" />
        <Skeleton className="w-[45%] mb-3 h-4 ml-3" />
        <Skeleton className="w-[40%] mb-3 h-4 ml-3" />
      </div>
      <div className="mt-3 w-full" key={2}>
        <Skeleton className="w-[55%] h-5 mb-3" />
        <Skeleton className="w-[35%] mb-3 h-4 ml-3" />
        <Skeleton className="w-[46%] mb-3 h-4 ml-3" />
      </div>
    </div>
  );
};

const FoldersList: React.FC<FoldersListProps> = ({ user }) => {
  const workspace = useAppSelector(
    (store) => store.workspace.current_workspace
  );
  const loading = useAppSelector((store) => store.workspace.loading);
  const params = useParams();
  const { lang } = useLanguage();

  return (
    <div className="pb-5" dir={getDirByLang(lang)}>
      {!loading && !workspace?.folders.length ? (
        <div className="text-center w-full">
          <small className="text-muted-foreground text-center">.......</small>
        </div>
      ) : null}
      {loading ? (
        <>
          <FolderListSkeleton />
        </>
      ) : (
        <div className="w-full md:ltr:pr-2 md:rtl:pl-2">
          {workspace?.folders
            .filter((f) => !f.inTrash)
            .map((f, i) => (
              <DropdownItem
                key={`dropdown-item-${i}-${f.id}`}
                type="folder"
                data={f}
                user={user}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default FoldersList;
