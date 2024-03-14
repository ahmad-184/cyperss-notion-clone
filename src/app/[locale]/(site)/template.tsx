import Navbar from "@/components/landing-page/Navbar";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <main className="w-full">
      <Navbar />
      {children}
    </main>
  );
}
