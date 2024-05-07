"use client";

import { SessionProvider } from "next-auth/react";
import { FC, ReactNode } from "react";
import ThemeProvider from "@/providers/NextThemeProvider";
import { Toaster } from "@/components/ui/Sonner";
import { Provider as LanguageContextProvider } from "@/contexts/language-context";
import { Provider as LocalContextProvider } from "@/contexts/local-context";
import StylesProviders from "@/providers/StylesProviders";
import { TooltipProvider } from "@/components/ui/Tooltip";

interface LayoutProps {
  children: ReactNode;
  locale: string;
  uploadcare_key: string;
}

const Providers: FC<LayoutProps> = ({ locale, uploadcare_key, children }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <LanguageContextProvider lang={locale || "en"}>
        <SessionProvider>
          <StylesProviders>
            <LocalContextProvider uploadcare_key={uploadcare_key}>
              <TooltipProvider>{children}</TooltipProvider>
            </LocalContextProvider>
          </StylesProviders>
        </SessionProvider>
        <Toaster lang={locale} />
      </LanguageContextProvider>
    </ThemeProvider>
  );
};

export default Providers;
