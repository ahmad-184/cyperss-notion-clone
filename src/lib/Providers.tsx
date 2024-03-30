"use client";

import { SessionProvider } from "next-auth/react";
import { FC, ReactNode } from "react";
import ThemeProvider from "@/providers/NextThemeProvider";
import { Toaster } from "@/components/ui/Sonner";
import { Provider as LanguageContextProvider } from "@/contexts/language-context";

interface LayoutProps {
  children: ReactNode;
  locale: string;
}

const Providers: FC<LayoutProps> = ({ locale, children }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <LanguageContextProvider lang={locale || "en"}>
        <SessionProvider>{children}</SessionProvider>
        <Toaster lang={locale} />
      </LanguageContextProvider>
    </ThemeProvider>
  );
};

export default Providers;
