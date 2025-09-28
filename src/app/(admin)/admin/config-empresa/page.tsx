import { auth } from "@/lib/auth/auth";
import EmpresaConfigView from "./components/empresa-view";

export const dynamic = "force-dynamic";

export default async function EmpresaConfigPage() {
    const session = await auth();
    const nombre = session?.user?.name ?? "Usuario";

    return (
        <div className="p-6 pt-0 space-y-4">
            <h1 className="text-2xl font-bold">Configuración de la empresa</h1>
            <p className="text-sm text-muted-foreground">
                Hola, {nombre}. Edita aquí los datos públicos de tu empresa.
            </p>
            <EmpresaConfigView />
        </div>
    );
}
