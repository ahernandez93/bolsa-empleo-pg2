import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q")?.trim();

        const where = q
            ? { nombre: { contains: q, mode: "insensitive" as const } }
            : {};

        const departamentos = await prisma.ubicacionDepartamento.findMany({
            where,
            select: { id: true, nombre: true },
            orderBy: { nombre: "asc" },
        });

        return NextResponse.json(departamentos, {
            headers: {
                "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
            },
        });
    } catch (err) {
        console.error("[GET /api/ubicaciones/departamentos] error:", err);
        return NextResponse.json(
            { message: "Error listando departamentos" },
            { status: 500 }
        );
    }
}
