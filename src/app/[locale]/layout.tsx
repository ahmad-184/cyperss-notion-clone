import type { Metadata } from "next";
import { Inter, Vazirmatn } from "next/font/google";
import "../globals.css";
import ThemeProvider from "@/Providers/NextThemeProvider";

const inter = Inter({ subsets: ["latin"], display: "swap" });
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
    <html lang="en" className="dark" dir={locale === "fa" ? "rtl" : "ltr"}>
      <body className={`${inter.className} ${vazir.className} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
