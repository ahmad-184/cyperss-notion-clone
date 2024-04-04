export default async function Layout({
  children,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return <div>{children}</div>;
}
