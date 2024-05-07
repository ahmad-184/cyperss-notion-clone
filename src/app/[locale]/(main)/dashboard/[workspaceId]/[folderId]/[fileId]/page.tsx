import EditorPage from "@/components/editor-page";
import { notFound } from "next/navigation";
import { validate } from "uuid";

export const revalidate = 0;

interface PageProps {
  params: {
    fileId: string;
    folderId: string;
  };
}

const Page = async ({ params }: PageProps) => {
  if (params.fileId) {
    const validateId = await validate(params.fileId);
    if (!validateId) notFound();
  }

  return (
    <div className="w-full">
      <EditorPage id={params.fileId} type="file" folderId={params.folderId} />
    </div>
  );
};

export default Page;
