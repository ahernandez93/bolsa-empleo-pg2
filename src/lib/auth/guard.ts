import { auth } from "@/lib/auth/auth";

export async function requireEmpresaSession() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("No autenticado");
    }

    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rol = (session.user as any).role as string | undefined;
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const empresaIdRaw = (session.user as any).empresaId as string | null;

    const isAdminAreaRole = rol === "ADMIN" || rol === "RECLUTADOR" || rol === "SUPERADMIN";
    if (!isAdminAreaRole) {
        throw new Error("No autorizado");
    }

    // Para ADMIN/RECLUTADOR, exigimos empresaId
    if ((rol === "ADMIN" || rol === "RECLUTADOR") && !empresaIdRaw) {
        throw new Error("Empresa no asociada");
    }

    const empresaId = rol === "SUPERADMIN" ? null : empresaIdRaw;

    return { session, empresaId, rol };
}
