import type { Metadata } from "next";
import { Inter, Vazirmatn } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const vazir = Vazirmatn({ subsets: ["arabic"], display: "swap" });

export const metadata: Metadata = {
  title: "Cypress",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${vazir.className} font-sans`}>
        {children}
      </body>
    </html>
  );
}
