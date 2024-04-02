"use client";

import { createContext } from "react";

export const Context = createContext({
  uploadcare_key: "",
});

export const Provider = ({
  uploadcare_key,
  children,
}: {
  uploadcare_key: string;
  children: React.ReactNode;
}) => {
  return (
    <Context.Provider
      value={{
        uploadcare_key: uploadcare_key || "",
      }}
    >
      {children}
    </Context.Provider>
  );
};
