"use client";

import { createContext, useContext } from "react";

export const Context = createContext({
  lang: "en",
});

export const useLanguage = () => useContext(Context);

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
