import type { Metadata } from "next";
import { DM_Sans, Vazirmatn } from "next/font/google";
import "../globals.css";
import ThemeProvider from "@/Providers/NextThemeProvider";
import { i18nConfig } from "../../../i18nConfig";
import { Toaster } from "@/components/ui/Sonner";
import { getDirByLang } from "@/lib/dir";

const dm_sans = DM_Sans({ subsets: ["latin"], display: "swap" });
const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cypress",
  description: "An all-in-one Collaboration and Productivity Platform.",
};

export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }));
}

export default function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: {
    locale: string;
  };
}>) {
  return (
    <html lang={locale || "en"} dir={getDirByLang(locale)}>
      <body className={`${dm_sans.className} ${vazirmatn.className}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster lang={locale} />
        </ThemeProvider>
      </body>
    </html>
  );
}
