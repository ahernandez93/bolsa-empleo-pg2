import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ canApply: false, missing: ["auth"] }, { status: 200 });
    }

    const perfil = await prisma.perfilCandidato.findUnique({
        where: { usuarioId: session.user.id },
        select: {
            cvUrl: true,
            usuario: {
                select: {
                    persona: { select: { telefono: true, ubicacionDepartamentoId: true, ubicacionCiudadId: true } },
                },
            },
        },
    });

    const missing: string[] = [];
    if (!perfil?.cvUrl) missing.push("cv");
    if (!perfil?.usuario?.persona?.telefono) missing.push("telefono");

    const depId = perfil?.usuario?.persona?.ubicacionDepartamentoId ?? null;
    const cityId = perfil?.usuario?.persona?.ubicacionCiudadId ?? null;
    if (!depId || !cityId) missing.push("ubicacion");

    return NextResponse.json({ canApply: missing.length === 0, missing }, { status: 200 });
}
