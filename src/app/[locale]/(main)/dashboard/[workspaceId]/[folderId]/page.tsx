import EditorPage from "@/components/editor-page";
import { notFound } from "next/navigation";
import { validate } from "uuid";

export const revalidate = 0;

interface PageProps {
  params: {
    folderId: string;
  };
}

const Page = async ({ params }: PageProps) => {
  if (params.folderId) {
    const validateId = await validate(params.folderId);
    if (!validateId) notFound();
  }

  return (
    <div className="w-full">
      <EditorPage id={params.folderId} type="folder" />
    </div>
  );
};

export default Page;
