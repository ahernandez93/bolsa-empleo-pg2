import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireEmpresaSession } from "@/lib/auth/guard";

const bodySchema = z.object({
    planNombre: z.enum(["Gratis", "Básico", "Premium"]),
});

function addMonths(date: Date, months: number) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}

export async function POST(req: Request) {
    try {
        const { empresaId, rol } = await requireEmpresaSession();

        if (!empresaId) {
            return NextResponse.json(
                { message: "Empresa no asociada" },
                { status: 400 }
            );
        }

        if (rol !== "ADMIN" && rol !== "SUPERADMIN") {
            return NextResponse.json({ message: "No autorizado" }, { status: 403 });
        }

        const json = await req.json();
        const { planNombre } = bodySchema.parse(json);

        // Traer el plan destino
        const plan = await prisma.plan.findUnique({
            where: { nombre: planNombre },
            select: { id: true, nombre: true, duracionMeses: true, maxOfertasActivas: true, incluyeDestacado: true },
        });
        if (!plan) return NextResponse.json({ message: "Plan no encontrado" }, { status: 404 });

        // Chequeo de downgrade
        const activas = await prisma.ofertaLaboral.count({
            where: { empresaId, estado: { in: ["PENDIENTE", "ABIERTA"] } },
        });
        if (activas > plan.maxOfertasActivas) {
            return NextResponse.json({
                message: `No se puede cambiar a ${plan.nombre}. Tienes ${activas} ofertas activas y el límite es ${plan.maxOfertasActivas}. Cierra o archiva ofertas primero.`,
            }, { status: 400 });
        }

        // Cancelar suscripción activa actual
        await prisma.suscripcion.updateMany({
            where: { empresaId, activa: true },
            data: { activa: false, canceladaEn: new Date() },
        });

        // Crear suscripción nueva
        const now = new Date();
        const nueva = await prisma.suscripcion.create({
            data: {
                empresaId,
                planId: plan.id,
                fechaInicio: now,
                fechaFin: addMonths(now, plan.duracionMeses),
                activa: true,
            },
            include: { plan: true },
        });

        return NextResponse.json({
            ok: true,
            suscripcion: {
                id: nueva.id,
                plan: nueva.plan.nombre,
                fechaInicio: nueva.fechaInicio,
                fechaFin: nueva.fechaFin,
            },
            message: `Plan cambiado a ${nueva.plan.nombre}`,
        });
    } catch (e) {
        console.error("POST /api/suscripcion/cambiar", e);
        if (e instanceof z.ZodError) {
            return NextResponse.json({ message: e.issues?.[0]?.message ?? "Datos inválidos" }, { status: 400 });
        }
        return NextResponse.json({ message: "Error interno" }, { status: 500 });
    }
}
