import EditorPage from "@/components/editor-page";
import { getAuthSession } from "@/lib/authOptions";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { validate } from "uuid";

export const revalidate = 0;
export const dynamic = "force-dynamic";
interface PageProps {
  params: {
    fileId: string;
    folderId: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const validateId = await validate(params.fileId);
  if (!validateId) notFound();

  const data = await db.file.findUnique({ where: { id: params.fileId } });

  if (!data) return notFound();

  const session = await getAuthSession();
  if (!session?.user) notFound();

  return (
    <div className="w-full">
      <EditorPage
        id={params.fileId}
        type="file"
        user={session.user}
        folderId={params.folderId}
      />
    </div>
  );
};

export default Page;
