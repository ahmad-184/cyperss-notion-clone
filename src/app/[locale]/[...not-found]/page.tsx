import { notFound } from "next/navigation";

export const metadata = {
  title: "404 - Page not found",
};

export default function NotFound() {
  return notFound();
}
