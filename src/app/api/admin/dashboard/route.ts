import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireEmpresaSession } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

const querySchema = z.object({
    from: z.string().datetime().optional(), // ISO
    to: z.string().datetime().optional(),   // ISO
    empresaId: z.string().optional(),
});

function rangeFromQuery(q: z.infer<typeof querySchema>) {
    const to = q.to ? new Date(q.to) : new Date();
    const from = q.from ? new Date(q.from) : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 días
    return { from, to };
}

export async function GET(req: Request) {
    try {
        const { empresaId, rol } = await requireEmpresaSession();
        const isSuperAdmin = rol === "SUPERADMIN";

        if (!isSuperAdmin && !empresaId) {
            return NextResponse.json({ message: "No autorizado" }, { status: 403 });
        }

        const url = new URL(req.url);
        const parsed = querySchema.safeParse({
            from: url.searchParams.get("from") ?? undefined,
            to: url.searchParams.get("to") ?? undefined,
            empresaId: url.searchParams.get("empresaId") ?? undefined,
        });
        if (!parsed.success) {
            return NextResponse.json({ message: "Parámetros inválidos" }, { status: 400 });
        }
        const { from, to } = rangeFromQuery(parsed.data);

        // Empresa seleccionada según rol
        const selectedEmpresaId = isSuperAdmin
            ? parsed.data.empresaId ?? undefined
            : empresaId!;

        // Helper para aplicar el filtro por empresa
        const empresaWhere = selectedEmpresaId ? { empresaId: selectedEmpresaId } : {};

        // Ofertas por estado (rango por fechaCreacion)
        const ofertasPorEstado = await prisma.ofertaLaboral.groupBy({
            by: ["estado"],
            _count: { _all: true },
            where: { ...empresaWhere, fechaCreacion: { gte: from, lte: to } },
        });

        const totalOfertas = ofertasPorEstado.reduce((acc, r) => acc + r._count._all, 0);

        // Postulaciones por estado (rango por fechaPostulacion)
        const postulacionesPorEstado = await prisma.postulacion.groupBy({
            by: ["estado"],
            _count: { _all: true },
            where: { fechaPostulacion: { gte: from, lte: to }, oferta: { ...empresaWhere } },
        });

        const totalPostulaciones = postulacionesPorEstado.reduce((acc, r) => acc + r._count._all, 0);

        // Top 5 ciudades por # de ofertas
        const topCiudadesGrp = await prisma.ofertaLaboral.groupBy({
            by: ["ubicacionCiudadId"],
            _count: { _all: true },
            where: { ...empresaWhere, fechaCreacion: { gte: from, lte: to } },
            orderBy: { _count: { id: "desc" } },
            take: 5,
        });
        const ciudadIds = topCiudadesGrp.map((g) => g.ubicacionCiudadId);
        const ciudades = await prisma.ubicacionCiudad.findMany({
            where: { id: { in: ciudadIds } },
            select: { id: true, nombre: true },
        });
        const ciudadMap = new Map(ciudades.map((c) => [c.id, c.nombre]));
        const topCiudades = topCiudadesGrp.map((g) => ({
            id: g.ubicacionCiudadId,
            nombre: ciudadMap.get(g.ubicacionCiudadId) ?? `Ciudad #${g.ubicacionCiudadId}`,
            count: g._count._all,
        }));

        // Alertas: ofertas ABIERTAS sin postulaciones en 14 días
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 14);
        const ofertasAbiertas = await prisma.ofertaLaboral.findMany({
            where: { estado: "ABIERTA", ...empresaWhere },
            select: { id: true, puesto: true, empresa: { select: { nombre: true } }, fechaCreacion: true, postulaciones: { select: { id: true }, where: { fechaPostulacion: { gte: cutoff } } } },
            orderBy: { fechaCreacion: "desc" },
            take: 50,
        });
        const ofertasSinPost = ofertasAbiertas
            .filter((o) => o.postulaciones.length === 0 && o.fechaCreacion <= cutoff)
            .map((o) => ({ id: o.id, puesto: o.puesto, empresa: o.empresa, fechaCreacion: o.fechaCreacion }));

        // Actividad reciente
        const ultimasOfertas = await prisma.ofertaLaboral.findMany({
            where: { ...empresaWhere, fechaCreacion: { gte: from, lte: to } },
            orderBy: { fechaCreacion: "desc" },
            select: { id: true, puesto: true, empresa: { select: { nombre: true } }, fechaCreacion: true },
            take: 5,
        });

        const ultimasPostulaciones = await prisma.postulacion.findMany({
            where: { fechaActualizacion: { gte: from, lte: to }, oferta: { ...empresaWhere } },
            orderBy: { fechaActualizacion: "desc" },
            select: {
                id: true,
                estado: true,
                fechaActualizacion: true,
                oferta: { select: { id: true, puesto: true, empresa: { select: { nombre: true } } } },
            },
            take: 5,
        });

        return NextResponse.json({
            range: { from, to },
            kpis: {
                totalOfertas,
                totalPostulaciones,
                ofertasAbiertas: ofertasPorEstado.find((r) => r.estado === "ABIERTA")?._count._all ?? 0,
                tasaAvance: (() => {
                    const avanzadas = postulacionesPorEstado
                        .filter((r) => !["SOLICITUD"].includes(r.estado))
                        .reduce((a, r) => a + r._count._all, 0);
                    return totalPostulaciones > 0 ? avanzadas / totalPostulaciones : 0;
                })(),
            },
            breakdowns: {
                ofertasPorEstado: Object.fromEntries(ofertasPorEstado.map((r) => [r.estado, r._count._all])),
                postulacionesPorEstado: Object.fromEntries(postulacionesPorEstado.map((r) => [r.estado, r._count._all])),
            },
            topCiudades,
            alerts: { ofertasSinPostulaciones14d: ofertasSinPost },
            actividad: { ultimasOfertas, ultimasPostulaciones },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        console.error("GET /api/admin/dashboard error:", e);
        const msg = e?.message || "No autorizado";
        const code = msg.includes("No autenticado") ? 401 : 403;
        return NextResponse.json({ message: msg }, { status: code });
    }
}
