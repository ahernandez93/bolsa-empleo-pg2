import { auth } from "@/lib/auth/auth";

export async function requireEmpresaSession() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("No autenticado");
    }

    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (session.user as any).role as string | undefined;
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const empresaId = (session.user as any).empresaId as string | null;

    const isAdminAreaRole = role === "ADMIN" || role === "RECLUTADOR" || role === "SUPERADMIN";
    if (!isAdminAreaRole) {
        throw new Error("No autorizado");
    }

    // Para ADMIN/RECLUTADOR, exigimos empresaId
    if ((role === "ADMIN" || role === "RECLUTADOR") && !empresaId) {
        throw new Error("Empresa no asociada");
    }

    return { session, empresaId: empresaId!, role };
}
