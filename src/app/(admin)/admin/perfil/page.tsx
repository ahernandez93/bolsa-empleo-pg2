import { auth } from "@/lib/auth/auth";
import PerfilEmpleadoView from "./components/perfil-view";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
    const session = await auth();
    const nombre = session?.user?.name ?? "Usuario";

    return (
        <div className="p-6 pt-0 space-y-4">
            <h1 className="text-2xl font-bold">Mi perfil</h1>
            <p className="text-sm text-muted-foreground">Hola, {nombre}. Aquí puedes ver y actualizar tu información básica.</p>
            <PerfilEmpleadoView />
        </div>
    );
}
