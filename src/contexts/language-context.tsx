"use client";

import { createContext } from "react";

export const Context = createContext({
  lang: "en",
});

export const Provider = ({
  lang,
  children,
}: {
  lang: string;
  children: React.ReactNode;
}) => {
  return (
    <Context.Provider
      value={{
        lang: lang || "en",
      }}
    >
      {children}
    </Context.Provider>
  );
};
