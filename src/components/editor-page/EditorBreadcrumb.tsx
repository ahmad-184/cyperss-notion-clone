import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/Breadcrumb";
import { useAppSelector } from "@/store";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Fragment, useMemo } from "react";

type EditorBreadCrumbProps = {
  type: "workspace" | "folder" | "file";
};

type CrumbsType = { icon: string; title: string; path: string }[];

const EditorBreadCrumb: React.FC<EditorBreadCrumbProps> = ({ type }) => {
  const params = useParams();
  const { current_workspace } = useAppSelector((store) => store.workspace);

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

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {paths?.map((p, i) => (
          <Fragment key={i}>
            <BreadcrumbItem>
              {paths.length === i + 1 ? (
                <BreadcrumbPage>
                  <div className="flex items-center gap-1">
                    {p.icon ? <span className="text-lg">{p.icon}</span> : null}
                    <p className="text-sm dark:text-gray-300">
                      {p?.title || "Untitled"}
                    </p>
                  </div>
                </BreadcrumbPage>
              ) : (
                <Link
                  href={p.path}
                  className="transition-colors hover:text-foreground dark:text-gray-500"
                >
                  <div className="flex items-center gap-1">
                    {p.icon ? <span className="text-lg">{p.icon}</span> : null}
                    <p className="text-sm">{p?.title || "Untitled"}</p>
                  </div>
                </Link>
              )}
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default EditorBreadCrumb;
