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
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_UPLOAD_FOLDER: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_PRESET: string;
}

const Providers: FC<LayoutProps> = ({
  locale,
  uploadcare_key,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_FOLDER,
  CLOUDINARY_API_KEY,
  CLOUDINARY_PRESET,
  children,
}) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <LanguageContextProvider lang={locale || "en"}>
        <SessionProvider>
          <StylesProviders>
            <LocalContextProvider
              uploadcare_key={uploadcare_key}
              CLOUDINARY_CLOUD_NAME={CLOUDINARY_CLOUD_NAME}
              CLOUDINARY_UPLOAD_FOLDER={CLOUDINARY_UPLOAD_FOLDER}
              CLOUDINARY_API_KEY={CLOUDINARY_API_KEY}
              CLOUDINARY_PRESET={CLOUDINARY_PRESET}
            >
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
