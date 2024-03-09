import type { Metadata } from "next";
import { DM_Sans, Vazirmatn } from "next/font/google";
import "../globals.css";
import ThemeProvider from "@/Providers/NextThemeProvider";

const dm_sans = DM_Sans({ subsets: ["latin"], display: "swap" });
const vazir = Vazirmatn({ subsets: ["arabic"], display: "swap" });

export const metadata: Metadata = {
  title: "Cypress",
  description: "",
};

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
    <html lang="en" dir={locale === "fa" ? "rtl" : "ltr"}>
      <body className={`${dm_sans.className} ${vazir.className} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
