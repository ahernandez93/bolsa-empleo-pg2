import { auth } from "@/lib/auth/auth";
import DashboardAdmin from "@/components/dashboardadmin/DashboardAdmin";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const name = session?.user?.name ?? "Usuario";

  return (
    <div className="flex flex-col gap-4 p-4 pt-0">
      <h1 className="text-2xl font-bold">Bienvenido {name}</h1>
      <DashboardAdmin />
    </div>
  );
}
