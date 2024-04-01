import { uploadClient } from "@/lib/uploader";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { UploadcareFile } from "@uploadcare/upload-client";

interface Props {
  ref: React.MutableRefObject<HTMLInputElement | null>;
}

const useUpload = ({ ref }: Props) => {
  const [inputElem, setInputElem] = useState<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[] | []>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (inputElem) return;
    if (ref.current) {
      setInputElem(ref.current);
    }
  }, [ref.current]);

  useEffect(() => {
    function handleGetFiles(e: any) {
      if (e.target.files?.length) {
        const filesArr = e.target.files;
        setFiles(filesArr);
      }
    }

    if (inputElem) {
      inputElem.addEventListener("change", handleGetFiles);
    }
    return () => {
      inputElem?.removeEventListener("change", handleGetFiles);
    };
  }, [inputElem]);

  const validateFile = (file: File) => {
    if (file.size > 2000000)
      return {
        error: {
          message: "File too large, size: more than 2MB",
        },
      };
    if (!file.type.startsWith("image/"))
      return {
        error: {
          message: "File type incorrect, just 'image type' allowed",
        },
      };
  };

  const startUpload = async (): Promise<UploadcareFile | null | undefined> => {
    try {
      if (!files) return;

      setIsUploading(true);

      const v = validateFile(files[0]);
      if (v?.error) {
        toast.error("Validation Error", {
          description: v.error.message,
        });
        return;
      }

      const res = await uploadClient.uploadFile(files[0]);
      toast.success("File uploaded successfully");
      return res;
    } catch (err: any) {
      console.log(err);
      toast.error("Getting error while uploading", {
        description:
          "We cant upload the image, please check your image size or network connection.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    files,
    startUpload,
    isUploading,
  };
};

export default useUpload;
