import { unstable_noStore as noStore } from "next/cache";
import GuardadosClient from "./components/guardados-client";

export const dynamic = "force-dynamic";

export default async function GuardadosPage() {
    noStore();
    return <GuardadosClient />;
}