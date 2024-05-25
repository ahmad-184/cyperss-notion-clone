import EditorPage from "@/components/editor-page";
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

  return (
    <div className="w-full">
      <EditorPage id={params.fileId} type="file" folderId={params.folderId} />
    </div>
  );
};

export default Page;
