import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const departamentoIdParam = searchParams.get("departamentoId");
        const q = searchParams.get("q")?.trim();

        if (!departamentoIdParam) {
            return NextResponse.json(
                { message: "Falta el parámetro 'departamentoId'." },
                { status: 400 }
            );
        }

        const departamentoId = Number(departamentoIdParam);
        if (!Number.isInteger(departamentoId) || departamentoId <= 0) {
            return NextResponse.json(
                { message: "El parámetro 'departamentoId' debe ser un entero positivo." },
                { status: 400 }
            );
        }

        const where = {
            departamentoId,
            ...(q ? { nombre: { contains: q, mode: "insensitive" as const } } : {}),
        };

        const ciudades = await prisma.ubicacionCiudad.findMany({
            where,
            select: { id: true, nombre: true },
            orderBy: { nombre: "asc" },
        });

        return NextResponse.json(ciudades, {
            headers: {
                "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
            },
        });
    } catch (err) {
        console.error("[GET /api/ubicaciones/ciudades] error:", err);
        return NextResponse.json(
            { message: "Error listando ciudades" },
            { status: 500 }
        );
    }
}
