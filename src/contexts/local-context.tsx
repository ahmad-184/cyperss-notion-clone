"use client";

import { createContext } from "react";

type ContextTypes = {
  uploadcare_key: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_UPLOAD_FOLDER: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_PRESET: string;
};

export const Context = createContext<ContextTypes>({
  uploadcare_key: "",
  CLOUDINARY_CLOUD_NAME: "",
  CLOUDINARY_UPLOAD_FOLDER: "",
  CLOUDINARY_API_KEY: "",
  CLOUDINARY_PRESET: "",
});

export const Provider = ({
  uploadcare_key,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_FOLDER,
  CLOUDINARY_API_KEY,
  CLOUDINARY_PRESET,
  children,
}: ContextTypes & {
  children: React.ReactNode;
}) => {
  return (
    <Context.Provider
      value={{
        uploadcare_key: uploadcare_key || "",
        CLOUDINARY_CLOUD_NAME: CLOUDINARY_CLOUD_NAME || "",
        CLOUDINARY_UPLOAD_FOLDER: CLOUDINARY_UPLOAD_FOLDER || "",
        CLOUDINARY_API_KEY: CLOUDINARY_API_KEY || "",
        CLOUDINARY_PRESET: CLOUDINARY_PRESET || "",
      }}
    >
      {children}
    </Context.Provider>
  );
};
