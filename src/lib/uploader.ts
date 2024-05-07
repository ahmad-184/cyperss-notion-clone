import axios, { AxiosError } from "axios";
import { toast } from "sonner";

export const uploader = async (
  File: File,
  key: string,
  setProgress?: React.Dispatch<React.SetStateAction<number>>
) => {
  try {
    const formData = new FormData();

    if (!File) {
      throw new Error("There is no file to upload");
    }

    formData.append("file", File);
    formData.append("UPLOADCARE_PUB_KEY", key);
    formData.append("UPLOADCARE_STORE", "auto");
    formData.append("source", "local");

    const res = await axios.post(
      `https://upload.uploadcare.com/base/`,
      formData,
      {
        onUploadProgress(progressEvent) {
          if (setProgress && progressEvent.total) {
            const { loaded, total } = progressEvent;
            let percent = Math.floor((loaded * 100) / total);
            if (!setProgress) return;
            setProgress(percent);
          }
        },
      }
    );

    if (res.status === 200) {
      const fileInfo = await getFileDataById(res.data.file, key);

      if (res.status === 200) return fileInfo;
    } else {
      toast.error("Unknown Error", {
        description: "Something went wrong, please try again",
      });
      return;
    }
  } catch (err: any) {
    if (err instanceof AxiosError) {
      toast.error("Axios Error", {
        description: err.message,
      });

      return;
    }
    toast.error("Unknown Error", {
      description: err.message || "Something went wrong, please try again",
    });
  } finally {
    if (setProgress) setProgress(0);
  }
};

export const getFileDataById = async (file_id: string, key: string) => {
  try {
    const url = `https://upload.uploadcare.com/info/?jsonerrors=1&pub_key=${key}&file_id=${file_id}`;

    const res = await axios.get(url);

    if (res.status === 200) return res.data;
  } catch (err: any) {
    console.log(err);
    if (err instanceof AxiosError) {
      toast.error("Axios Error", {
        description: err.message,
      });

      return;
    }
    toast.error("Unknown Error", {
      description: err.message || "Something went wrong, please try again",
    });
  }
};
