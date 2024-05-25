import EditorPage from "@/components/editor-page";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { validate } from "uuid";

export const revalidate = 0;
export const dynamic = "force-dynamic";
interface PageProps {
  params: {
    folderId: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const validateId = await validate(params.folderId);
  if (!validateId) notFound();

  const data = await db.folder.findUnique({ where: { id: params.folderId } });

  if (!data) return notFound();

  return (
    <div className="w-full">
      <EditorPage id={params.folderId} type="folder" />
    </div>
  );
};

export default Page;
