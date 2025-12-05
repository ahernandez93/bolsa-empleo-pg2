import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEmpresaSession } from "@/lib/auth/guard";
import { empresaConfigSchema } from "@/lib/schemas/empresaConfigSchema";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const { empresaId } = await requireEmpresaSession();

        if (!empresaId) {
            return NextResponse.json(
                { message: "Empresa no asociada" },
                { status: 400 }
            );
        }

        const empresa = await prisma.empresa.findUnique({
            where: { id: empresaId },
            select: {
                id: true, nombre: true, rtn: true, sitioWeb: true, telefono: true, descripcion: true,
                ubicacionDepartamentoId: true, ubicacionCiudadId: true, activa: true,
                suscripciones: {
                    where: { activa: true },
                    select: { id: true, fechaFin: true, plan: { select: { id: true, nombre: true, maxOfertasActivas: true, incluyeDestacado: true } } },
                    take: 1,
                },
            },
        });

        if (!empresa) {
            return NextResponse.json({ message: "Empresa no encontrada" }, { status: 404 });
        }

        const sus = empresa.suscripciones[0] ?? null;

        return NextResponse.json({
            empresa: {
                id: empresa.id,
                nombre: empresa.nombre,
                rtn: empresa.rtn ?? "",
                sitioWeb: empresa.sitioWeb ?? "",
                telefono: empresa.telefono ?? "",
                descripcion: empresa.descripcion ?? "",
                ubicacionDepartamentoId: empresa.ubicacionDepartamentoId ?? undefined,
                ubicacionCiudadId: empresa.ubicacionCiudadId ?? undefined,
                activa: empresa.activa,
                plan: sus
                    ? {
                        id: sus.plan.id,
                        nombre: sus.plan.nombre,
                        maxOfertasActivas: sus.plan.maxOfertasActivas,
                        incluyeDestacado: sus.plan.incluyeDestacado,
                        vence: sus.fechaFin,
                    }
                    : null,
            },
        });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Error interno";
        const code = msg.includes("No autenticado") ? 401 : 500;
        return NextResponse.json({ message: msg }, { status: code });
    }
}

export async function PUT(req: Request) {
    try {
        const { empresaId } = await requireEmpresaSession();

        if (!empresaId) {
            return NextResponse.json(
                { message: "Empresa no asociada" },
                { status: 400 }
            );
        }

        const body = await req.json();

        const parsed = empresaConfigSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Datos inválidos", errors: parsed.error.flatten() },
                { status: 400 }
            );
        }
        const data = parsed.data;

        const telefono = data.telefono?.trim() ? data.telefono.trim() : null;
        const descripcion = data.descripcion?.trim() ? data.descripcion.trim() : null;
        const sitioWeb = data.sitioWeb?.trim() ? data.sitioWeb.trim() : null;
        const rtn = data.rtn?.trim() ? data.rtn.trim() : null;

        const ubicacionDepartamentoId =
            typeof data.ubicacionDepartamentoId === "number" ? data.ubicacionDepartamentoId : null;

        const ubicacionCiudadId =
            typeof data.ubicacionCiudadId === "number" ? data.ubicacionCiudadId : null;

        const updated = await prisma.empresa.update({
            where: { id: empresaId },
            data: {
                nombre: data.nombre,
                rtn,
                sitioWeb,
                telefono,
                descripcion,
                ubicacionDepartamentoId,
                ubicacionCiudadId,
                ...(typeof data.activa === "boolean" ? { activa: data.activa } : {}), // opcional
            },
            select: {
                id: true, nombre: true, rtn: true, sitioWeb: true, telefono: true, descripcion: true,
                ubicacionDepartamentoId: true, ubicacionCiudadId: true, activa: true,
            },
        });

        return NextResponse.json({ message: "Empresa actualizada", empresa: updated });
    } catch (e) {
        if (e instanceof z.ZodError) {
            return NextResponse.json({ message: "Datos inválidos", errors: e.flatten() }, { status: 400 });
        }
        const msg = e instanceof Error ? e.message : "Error interno";
        const code = msg.includes("No autenticado") ? 401 : 500;
        return NextResponse.json({ message: msg }, { status: code });
    }
}
