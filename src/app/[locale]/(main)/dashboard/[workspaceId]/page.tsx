import EditorPage from "@/components/editor-page";
import { getAuthSession } from "@/lib/authOptions";
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

  const session = await getAuthSession();
  if (!session?.user) notFound();

  return (
    <div className="w-full">
      <EditorPage
        id={params.workspaceId}
        user={session?.user}
        type="workspace"
      />
    </div>
  );
}
