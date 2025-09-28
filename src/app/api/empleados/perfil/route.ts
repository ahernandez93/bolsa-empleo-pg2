import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEmpresaSession } from "@/lib/auth/guard";
import { empleadoPerfilSchema } from "@/lib/schemas/empleadoPerfilSchema";
import { z } from "zod";

export const dynamic = "force-dynamic";

// GET: perfil del usuario autenticado (ADMIN/RECLUTADOR)
export async function GET() {
    try {
        const { session, empresaId, role } = await requireEmpresaSession();

        const usuario = await prisma.usuario.findUnique({
            where: { id: session?.user?.id },
            include: {
                persona: true,
                empresa: { select: { id: true, nombre: true } },
            },
        });

        if (!usuario || !usuario.persona) {
            return NextResponse.json({ message: "Perfil no encontrado" }, { status: 404 });
        }

        const p = usuario.persona;
        return NextResponse.json({
            perfil: {
                id: p.id,
                nombre: p.nombre,
                apellido: p.apellido,
                telefono: p.telefono ?? "",
                direccion: p.direccion ?? "",
                fechaNacimiento: p.fechaNacimiento ? p.fechaNacimiento.toISOString().slice(0, 10) : "",
                genero: p.genero ?? "",
                ubicacionDepartamentoId: p.ubicacionDepartamentoId ?? undefined,
                ubicacionCiudadId: p.ubicacionCiudadId ?? undefined,
                email: usuario.email,
                empresa: usuario.empresa ? { id: empresaId, nombre: usuario.empresa.nombre } : null,
                role,
            },
        });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Error interno";
        const code = msg.includes("No autenticado") ? 401 : 500;
        return NextResponse.json({ message: msg }, { status: code });
    }
}

// PUT: actualizar perfil básico del usuario autenticado
export async function PUT(req: Request) {
    try {
        const { session } = await requireEmpresaSession();
        const body = await req.json();

        const parsed = empleadoPerfilSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Datos inválidos", errors: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const data = parsed.data;

        // usuario->persona
        const usuario = await prisma.usuario.findUnique({
            where: { id: session?.user?.id },
            select: { personaId: true },
        });
        if (!usuario?.personaId) {
            return NextResponse.json({ message: "Persona no encontrada" }, { status: 404 });
        }

        const updated = await prisma.persona.update({
            where: { id: usuario.personaId },
            data: {
                nombre: data.nombre,
                apellido: data.apellido,
                telefono: data.telefono || null,
                direccion: data.direccion || null,
                fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : undefined,
                //eslint-disable-next-line @typescript-eslint/no-explicit-any
                genero: data.genero && (data.genero as any),
                ubicacionDepartamentoId: data.ubicacionDepartamentoId ?? null,
                ubicacionCiudadId: data.ubicacionCiudadId ?? null,
            },
            select: {
                id: true, nombre: true, apellido: true, telefono: true, direccion: true,
                fechaNacimiento: true, genero: true, ubicacionDepartamentoId: true, ubicacionCiudadId: true
            }
        });

        return NextResponse.json({ message: "Perfil actualizado", perfil: updated });
    } catch (e) {
        if (e instanceof z.ZodError) {
            return NextResponse.json({ message: "Datos inválidos", errors: e.flatten() }, { status: 400 });
        }
        const msg = e instanceof Error ? e.message : "Error interno";
        const code = msg.includes("No autenticado") ? 401 : 500;
        return NextResponse.json({ message: msg }, { status: code });
    }
}
