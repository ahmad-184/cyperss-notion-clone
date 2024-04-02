"use client";

import { SessionProvider } from "next-auth/react";
import { FC, ReactNode } from "react";
import ThemeProvider from "@/providers/NextThemeProvider";
import { Toaster } from "@/components/ui/Sonner";
import { Provider as LanguageContextProvider } from "@/contexts/language-context";
import { Provider as LocalContextProvider } from "@/contexts/local-context";

interface LayoutProps {
  children: ReactNode;
  locale: string;
  uploadcare_key: string;
}

const Providers: FC<LayoutProps> = ({ locale, uploadcare_key, children }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <LanguageContextProvider lang={locale || "en"}>
        <LocalContextProvider uploadcare_key={uploadcare_key}>
          <SessionProvider>{children}</SessionProvider>
          <Toaster lang={locale} />
        </LocalContextProvider>
      </LanguageContextProvider>
    </ThemeProvider>
  );
};

export default Providers;
