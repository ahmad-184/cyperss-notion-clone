import ReduxStoreProvider from "@/providers/ReduxStoreProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <ReduxStoreProvider>{children}</ReduxStoreProvider>
    </main>
  );
}
