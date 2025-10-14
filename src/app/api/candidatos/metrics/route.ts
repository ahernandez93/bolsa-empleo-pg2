export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET() {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) {
            return NextResponse.json({ message: "No autenticado" }, { status: 401 });
        }

        // Buscamos el perfil del candidato (puede no existir aún)
        const perfil = await prisma.perfilCandidato.findUnique({
            where: { usuarioId: userId },
            select: { id: true },
        });

        if (!perfil) {
            // Si aún no creó su perfil, devolvemos ceros
            return NextResponse.json({
                aplicadas: 0,
                guardadas: 0,
                entrevistas: 0,
                evaluaciones: 0,
                contratacion: 0,
                rechazada: 0,
            });
        }

        // ⚠️ Ajusta los valores de estado si tu modelo usa otros nombres
        const [aplicadas, guardadas, entrevistas, evaluaciones, contratacion, rechazada] = await Promise.all([
            prisma.postulacion.count({
                where: { perfilCandidatoId: perfil.id },
            }),
            prisma.guardadoOferta.count({
                where: { userId },
            }),
            prisma.postulacion.count({
                where: { perfilCandidatoId: perfil.id, estado: "ENTREVISTA" },
            }),
            prisma.postulacion.count({
                where: { perfilCandidatoId: perfil.id, estado: "EVALUACIONES" },
            }),
            prisma.postulacion.count({
                where: { perfilCandidatoId: perfil.id, estado: "CONTRATACION" },
            }),
            prisma.postulacion.count({
                where: { perfilCandidatoId: perfil.id, estado: "RECHAZADA" },
            }),
        ]);

        return NextResponse.json({ aplicadas, guardadas, entrevistas, evaluaciones, contratacion, rechazada });
    } catch (e) {
        console.error("GET /api/candidatos/metrics error →", e);
        return NextResponse.json(
            { message: "Error del servidor" },
            { status: 500 }
        );
    }
}
