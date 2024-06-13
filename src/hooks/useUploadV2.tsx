"use client";

import { v4 as uuid4 } from "uuid";
import { useEffect, useState, useContext } from "react";
import { toast } from "sonner";
import { Context } from "@/contexts/local-context";
import axios from "axios";
import { useTranslation } from "react-i18next";

// upload files using cloudinary storage
("---------------------------------------------------");

interface Props {
  ref: React.MutableRefObject<HTMLInputElement | null>;
  max_size?: number;
}

type uploadedFileTypes = {
  asset_id: string;
  bytes: number;
  created_at: string;
  etag: string;
  existing: boolean;
  folder: string;
  format: string;
  height: number;
  original_filename: string;
  placeholder: boolean;
  public_id: string;
  resource_type: string;
  secure_url: string;
  signature: string;
  type: string;
  version: number;
  version_id: string;
  width: number;
  tags: string[];
};

export default function useUploadV2({ ref, max_size = 3 }: Props) {
  const [files, setFiles] = useState<File[] | []>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { t } = useTranslation();

  const {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UPLOAD_FOLDER,
    CLOUDINARY_API_KEY,
    CLOUDINARY_PRESET,
  } = useContext(Context);

  useEffect(() => {
    function handleGetFiles(e: any) {
      if (e.target.files?.length) {
        const filesArr = e.target.files;
        setFiles(filesArr);
      }
    }

    if (ref.current) {
      ref.current.addEventListener("change", handleGetFiles);
    }
    return () => {
      ref.current?.removeEventListener("change", handleGetFiles);
    };
  }, [ref.current]);

  const validateFile = (file: File) => {
    if (file.size > 1000000 * max_size)
      return {
        error: {
          message: t("dashboard:file-too-large", { num: max_size }),
        },
      };
    if (!file.type.startsWith("image/"))
      return {
        error: {
          message: t("dasboard:file-type-incorrect"),
        },
      };
  };

  const startUpload = async () => {
    try {
      if (!files.length) return [];

      let uploadedFiles = [];
      setIsUploading(true);
      for (let file of files) {
        const formData = new FormData();
        const fileType = file.type;
        const isImage = Boolean(fileType.startsWith("image"));
        const isVideo = Boolean(fileType.startsWith("video"));
        const isAudio = Boolean(fileType.startsWith("audio"));
        const isPdf = Boolean(fileType.startsWith("pdf"));

        const err = validateFile(file);
        if (err) {
          toast.error(err.error.message);
          return;
        }
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_PRESET);
        formData.append("api_key", CLOUDINARY_API_KEY);
        formData.append("cloud_name", CLOUDINARY_CLOUD_NAME);
        formData.append("folder", CLOUDINARY_UPLOAD_FOLDER);
        formData.append("public_id", `${file.name}-${uuid4()}`);
        if (isPdf) {
          formData.append("tags", "fl_attachment");
        }

        try {
          const res = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${
              isImage
                ? "image"
                : isVideo
                ? "video"
                : isPdf
                ? "image"
                : isAudio
                ? "raw"
                : "raw"
            }/upload`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              onUploadProgress: (progressEvent: any) => {
                const { loaded, total } = progressEvent;
                let percent = Math.floor((loaded * 100) / total);
                if (percent < 100) {
                  setProgress(percent);
                }
              },
            }
          );

          setProgress(0);
          uploadedFiles.push({
            file: res.data as uploadedFileTypes,
            type: fileType,
          });
        } catch (err) {
          toast.error(t("dashboard:error-message"));
          console.log(err);
        }
      }
      return uploadedFiles;
    } catch (err) {
      console.log(err);
      toast.error(t("dashboard:error-message"));
    } finally {
      setIsUploading(false);
      setFiles([]);
      if (ref.current) {
        ref.current.value = "";
      }
    }
  };

  return {
    files,
    startUpload,
    isUploading,
    progress,
  };
}
