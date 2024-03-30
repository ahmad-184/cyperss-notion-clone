import { getAuthSession } from "@/lib/authOptions";

export default async function Page() {
  const session = await getAuthSession();
  console.log(session);
  return <div>Dashboard</div>;
}
