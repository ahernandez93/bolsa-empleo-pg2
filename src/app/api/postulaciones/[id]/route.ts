import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { postulacionFormSchema } from "@/lib/schemas/postulacionSchema";
import z from "zod";

export const runtime = "nodejs";

type Params = { id: string };

export async function GET(req: Request, ctx : { params: Promise<Params> }) {
    try {
        const { id } = await ctx.params
        const p = await prisma.postulacion.findUnique({
            where: { id },
            select: {
                id: true,
                estado: true,
                notasInternas: true,
                fechaPostulacion: true,
                oferta: { select: { puesto: true } },
                perfil: {
                    select: {
                        usuario: {
                            select: {
                                email: true,
                                persona: { select: { nombre: true, apellido: true } },
                            },
                        },
                    },
                },
            },
        })

        if (!p) {
            return NextResponse.json({ message: "Postulación no encontrada" }, { status: 404 })
        }

        const initialData = {
            id: p.id,
            estado: p.estado,
            notasInternas: p.notasInternas ?? null,
            fechaPostulacion: p.fechaPostulacion.toISOString(),
            ofertaPuesto: p.oferta.puesto,
            candidatoNombre: p.perfil.usuario.persona
                ? `${p.perfil.usuario.persona.nombre} ${p.perfil.usuario.persona.apellido}`.trim()
                : null,
            candidatoEmail: p.perfil.usuario.email,
        }

        return NextResponse.json(initialData)
    } catch (e) {
        console.error(e)
        return NextResponse.json({ message: "Error cargando postulación" }, { status: 500 })
    }
}

export async function PATCH(req: Request, ctx : { params: Promise<Params> }) {

    try {
        const { id } = await ctx.params
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ message: "No autenticado" }, { status: 401 })
        }

        // cargar el rol desde la BD
        const usuario = await prisma.usuario.findUnique({
            where: { id: session.user.id },
            select: { rol: true },
        })
        if (!usuario || !["ADMIN", "RECLUTADOR"].includes(usuario.rol)) {
            return NextResponse.json({ message: "No autorizado" }, { status: 403 })
        }

        const body = await req.json()
        const { estado, notasInternas } = postulacionFormSchema.parse(body)

        const postulacion = await prisma.postulacion.update({
            where: { id },
            data: {
                estado,
                notasInternas: notasInternas?.trim() || null,
            },
            select: {
                id: true,
                estado: true,
                notasInternas: true,
                fechaActualizacion: true,
            },
        })

        return NextResponse.json({ message: "Postulación actualizada", postulacion })
    } catch (err) {
        console.error("[PATCH /postulaciones/:id] error:", err)
        if (err instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Datos inválidos", errors: err.flatten() },
                { status: 400 }
            )
        }
        return NextResponse.json({ message: "Error al actualizar la postulación" }, { status: 500 })
    }
}

export async function DELETE(req: Request, ctx : { params: Promise<Params> }) {
    try {
        const { id } = await ctx.params

        const postulacion = await prisma.postulacion.findUnique({
            where: { id },
        });

        if (!postulacion) {
            return NextResponse.json(
                { message: "Postulación no encontrada" },
                { status: 404 }
            );
        }

        await prisma.postulacion.delete({
            where: { id },
        });

        return NextResponse.json(
            { message: "Postulación eliminada correctamente" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error eliminando postulación:", error);
        return NextResponse.json(
            { message: "Error interno al eliminar la postulación" },
            { status: 500 }
        );
    }

}

