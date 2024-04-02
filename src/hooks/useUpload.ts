"use client";

import { useEffect, useState, useContext } from "react";
import { toast } from "sonner";
import { uploader } from "@/lib/uploader";
import { Context } from "@/contexts/local-context";

interface Props {
  ref: React.MutableRefObject<HTMLInputElement | null>;
}

const useUpload = ({ ref }: Props) => {
  const [inputElem, setInputElem] = useState<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[] | []>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const { uploadcare_key } = useContext(Context);

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
          message: "File too large, size: more than 1MB",
        },
      };
    if (!file.type.startsWith("image/"))
      return {
        error: {
          message: "File type incorrect, just 'image type' allowed",
        },
      };
  };

  const startUpload = async () => {
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

      const res = await uploader(files[0], uploadcare_key, setProgress);
      if (!res?.done) {
        console.log(res);
        return;
      }
      if (res.file) toast.success("File uploaded successfully");
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
    progress,
  };
};

export default useUpload;
