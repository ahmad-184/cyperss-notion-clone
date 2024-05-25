import EditorPage from "@/components/editor-page";
import { notFound } from "next/navigation";
import { validate } from "uuid";

export const revalidate = 0;
export const dynamic = "force-dynamic";
interface PageProps {
  params: {
    workspaceId: string;
  };
}

export default async function Page({ params }: PageProps) {
  const validateId = await validate(params.workspaceId);
  if (!validateId) notFound();

  return (
    <div className="w-full">
      <EditorPage id={params.workspaceId} type="workspace" />
    </div>
  );
}
