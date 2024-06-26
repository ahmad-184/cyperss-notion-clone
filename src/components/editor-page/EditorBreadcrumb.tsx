import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/Breadcrumb";
import { useAppSelector } from "@/store";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Fragment, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FolderType, User, WorkspaceTypes } from "@/types";
import { File } from "@prisma/client";
import { Input } from "../ui/Input";
import { cn } from "@/lib/utils";
import EmojiPickerMart from "../EmojiPickerMart";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";

type EditorBreadCrumbProps = {
  type: "workspace" | "folder" | "file";
  data: WorkspaceTypes | FolderType | File | null;
  user: User;
  handleChangeTitle: (e: any) => void;
  handleChangeEmoji: (value: string) => void;
};

type CrumbsType = { icon: string; title: string; path: string }[];

const EditorBreadCrumb: React.FC<EditorBreadCrumbProps> = ({
  type,
  data,
  handleChangeTitle,
  handleChangeEmoji,
}) => {
  const params = useParams();
  const { current_workspace } = useAppSelector((store) => store.workspace);
  const { t } = useTranslation();

  const inputRef = useRef<HTMLInputElement | null>(null);

  const paths = useMemo(() => {
    if (!current_workspace) return [];

    let crumbs: CrumbsType = [];

    if (params.workspaceId) {
      crumbs.push({
        icon: current_workspace.iconId || "",
        title: current_workspace.title,
        path: `/dashboard/${current_workspace.id}`,
      });
    }

    if (params.folderId) {
      const folderData = current_workspace.folders.find(
        (e) => e.id === params.folderId
      );

      if (!folderData) return [];
      crumbs.push({
        icon: folderData.iconId || "",
        title: folderData.title,
        path: `/dashboard/${current_workspace.id}/${folderData.id}`,
      });
    }

    if (params.fileId) {
      const fileData = current_workspace.folders
        .find((e) => e.id === params.folderId)
        ?.files.find((e) => e.id === params.fileId);

      crumbs.push({
        icon: fileData?.iconId || "",
        title: fileData?.title!,
        path: `/dashboard/${current_workspace.id}/${fileData?.id}/${fileData?.id}`,
      });
    }
    return crumbs;
  }, [type, params.folderId, params.fileId, current_workspace]);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.focus();
  }, [inputRef.current]);

  return (
    <div className="flex flex-grow">
      <Breadcrumb>
        <BreadcrumbList>
          {paths?.map((p, i) => (
            <Fragment key={i}>
              <BreadcrumbItem>
                {paths.length === i + 1 ? (
                  <BreadcrumbPage className="max-w-[200px]">
                    <Popover>
                      <PopoverTrigger asChild>
                        <div
                          // onClick={handleOpen}
                          className="flex items-center gap-1 cursor-pointer truncate"
                        >
                          {p.icon ? (
                            <span className="text-lg">{p.icon}</span>
                          ) : null}
                          <p className="text-sm dark:text-gray-300 truncate">
                            {p?.title || t("dashboard:untitled")}
                          </p>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="py-[3px] px-1 w-[340px]">
                        <div
                          className={cn(
                            "flex gap-1 items-center w-full text-sm"
                          )}
                        >
                          {/* <div className="p-1 rounded-sm border dark:bg-zinc-900"> */}
                          <EmojiPickerMart
                            classNames="p-1 rounded-sm border dark:bg-zinc-900 bg-zinc-100"
                            onChangeEmoji={handleChangeEmoji}
                            emoji={data?.iconId || ""}
                          />
                          {/* </div> */}
                          <Input
                            placeholder={t("dashboard:untitled")}
                            className="flex-grow dark:bg-zinc-900 bg-zinc-100 ring-0 focus-visible:ring-0 rounded-sm focus-visible:ring-offset-0 h-8 px-3 py-0"
                            value={data?.title}
                            onChange={handleChangeTitle}
                            ref={inputRef}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </BreadcrumbPage>
                ) : (
                  <Link
                    href={p.path}
                    className="transition-colors hover:text-foreground dark:text-gray-500"
                  >
                    <div className="flex items-center gap-1">
                      {p.icon ? (
                        <span className="text-lg">{p.icon}</span>
                      ) : null}
                      <p className="text-sm">
                        {p?.title || t("dashboard:untitled")}
                      </p>
                    </div>
                  </Link>
                )}
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default EditorBreadCrumb;
