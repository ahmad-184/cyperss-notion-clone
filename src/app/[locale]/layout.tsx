import { DM_Sans, Vazirmatn } from "next/font/google";
import type { Metadata } from "next";
import "../globals.css";
import { i18nConfig } from "../../../i18nConfig";
import { getDirByLang } from "@/lib/dir";
import Providers from "@/lib/Providers";

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
        <Providers
          locale={locale || "en"}
          uploadcare_key={process.env.UPLOADCARE_KEY as string}
          CLOUDINARY_CLOUD_NAME={process.env.CLOUDINARY_CLOUD_NAME as string}
          CLOUDINARY_UPLOAD_FOLDER={
            process.env.CLOUDINARY_UPLOAD_FOLDER as string
          }
          CLOUDINARY_API_KEY={process.env.CLOUDINARY_API_KEY as string}
          CLOUDINARY_PRESET={process.env.CLOUDINARY_PRESET as string}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
