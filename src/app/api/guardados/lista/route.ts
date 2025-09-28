import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Validamos query params
const querySchema = z.object({
    q: z.string().optional().default(""),
    order: z.enum(["recientes", "empresa", "ciudad"]).optional().default("recientes"),
});

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ message: "No autenticado" }, { status: 401 });
        }

        const url = new URL(req.url);
        const parsed = querySchema.safeParse({
            q: url.searchParams.get("q") ?? "",
            //eslint-disable-next-line @typescript-eslint/no-explicit-any
            order: (url.searchParams.get("order") as any) ?? "recientes",
        });

        if (!parsed.success) {
            return NextResponse.json({ message: "Parámetros inválidos" }, { status: 400 });
        }
        const { q, order } = parsed.data;

        const orderBy =
            order === "empresa"
                ? [{ oferta: { empresa: { nombre: "asc" as const } } }]
                : order === "ciudad"
                    ? [{ oferta: { ubicacionCiudad: { nombre: "asc" as const } } }]
                    : [{ createdAt: "desc" as const }];

        const items = await prisma.guardadoOferta.findMany({
            where: {
                userId: session.user.id as string,
                ...(q
                    ? {
                        oferta: {
                            OR: [
                                { puesto: { contains: q, mode: "insensitive" } },
                                { empresa: { nombre: { contains: q, mode: "insensitive" } } },
                                { ubicacionCiudad: { nombre: { contains: q, mode: "insensitive" } } },
                                { ubicacionDepartamento: { nombre: { contains: q, mode: "insensitive" } } },
                            ],
                        },
                    }
                    : {}),
            },
            orderBy,
            select: {
                createdAt: true,
                oferta: {
                    select: {
                        id: true,
                        puesto: true,
                        empresa: {
                            select: {
                                nombre: true,
                            },
                        },
                        ubicacionCiudad: {
                            select: {
                                nombre: true,
                            },
                        },
                        ubicacionDepartamento: {
                            select: {
                                nombre: true,
                            },
                        },
                        modalidad: true,
                        tipoTrabajo: true,
                        fechaCreacion: true,
                    },
                },
            },
        });

        // Normalizamos para tus cards
        const data = items.map((g) => ({
            id: g.oferta.id,
            puesto: g.oferta.puesto,
            empresa: g.oferta.empresa?.nombre ?? "—",
            ubicacionCiudadDescripcion: g.oferta.ubicacionCiudad?.nombre ?? "",
            ubicacionDepartamentoDescripcion: g.oferta.ubicacionDepartamento?.nombre ?? "",
            modalidad: g.oferta.modalidad,
            tipoTrabajo: g.oferta.tipoTrabajo,
            fechaCreacion: g.oferta.fechaCreacion,
            isSaved: true, // vienen de guardados
            savedAt: g.createdAt,
        }));

        return NextResponse.json({ items: data });
    } catch (err) {
        console.error("GET /api/guardados/list error:", err);
        return NextResponse.json({ message: "Error interno" }, { status: 500 });
    }
}
