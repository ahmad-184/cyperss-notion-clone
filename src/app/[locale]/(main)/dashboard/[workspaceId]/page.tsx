import EditorPage from "@/components/editor-page";

export const revalidate = 0;

interface PageProps {
  params: {
    workspaceId: string;
  };
}

export default function Page({ params }: PageProps) {
  return (
    <div className="w-full">
      <EditorPage id={params.workspaceId} type="workspace" />
    </div>
  );
}
