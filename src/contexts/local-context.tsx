"use client";

import { createContext, useState } from "react";

type ContextTypes = {
  uploadcare_key: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_UPLOAD_FOLDER: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_PRESET: string;
  REALTIMNE_SERVER_DEVELOPMENT: string;
  REALTIMNE_SERVER_PRODUCTION: string;
  APP_MODE: string;
  mobile_sidebar_open: boolean;
  mobileSidebarOpen: (e: boolean) => void;
};

type ProviderProps = Omit<
  ContextTypes,
  "mobile_sidebar_open" | "mobileSidebarOpen"
> & {
  children: React.ReactNode;
};

export const Context = createContext<ContextTypes>({
  uploadcare_key: "",
  CLOUDINARY_CLOUD_NAME: "",
  CLOUDINARY_UPLOAD_FOLDER: "",
  CLOUDINARY_API_KEY: "",
  CLOUDINARY_PRESET: "",
  REALTIMNE_SERVER_DEVELOPMENT: "",
  REALTIMNE_SERVER_PRODUCTION: "",
  APP_MODE: "",
  mobile_sidebar_open: false,
  mobileSidebarOpen: () => {},
});

export const Provider = ({
  uploadcare_key,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_FOLDER,
  CLOUDINARY_API_KEY,
  CLOUDINARY_PRESET,
  REALTIMNE_SERVER_DEVELOPMENT,
  REALTIMNE_SERVER_PRODUCTION,
  APP_MODE,
  children,
}: ProviderProps) => {
  const [mobile_sidebar_open, setMobile_sidebar_open] = useState(false);

  const mobileSidebarOpen = (e: boolean) =>
    setMobile_sidebar_open((prev) => e || !prev);

  return (
    <Context.Provider
      value={{
        uploadcare_key: uploadcare_key || "",
        CLOUDINARY_CLOUD_NAME: CLOUDINARY_CLOUD_NAME || "",
        CLOUDINARY_UPLOAD_FOLDER: CLOUDINARY_UPLOAD_FOLDER || "",
        CLOUDINARY_API_KEY: CLOUDINARY_API_KEY || "",
        CLOUDINARY_PRESET: CLOUDINARY_PRESET || "",
        REALTIMNE_SERVER_DEVELOPMENT: REALTIMNE_SERVER_DEVELOPMENT || "",
        REALTIMNE_SERVER_PRODUCTION: REALTIMNE_SERVER_PRODUCTION || "",
        APP_MODE: APP_MODE,
        mobile_sidebar_open,
        mobileSidebarOpen,
      }}
    >
      {children}
    </Context.Provider>
  );
};
