// src/app/api/postulaciones/[id]/estado/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth/auth"
import { z } from "zod"
import { sendEstadoPostulacionEmail } from "@/lib/mailer"

export const runtime = "nodejs"

// Debe coincidir con tu enum en Prisma (incluye RETIRADA si lo agregaste)
const EstadoEnum = z.enum(["SOLICITUD", "ENTREVISTA", "EVALUACIONES", "CONTRATACION", "RECHAZADA"])
const BodySchema = z.object({ estado: EstadoEnum })

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ message: "No autenticado" }, { status: 401 })
        }

        const user = await prisma.usuario.findUnique({
            where: { id: session.user.id },
            select: { rol: true, activo: true },
        })

        if (!user || !user.activo) {
            return { ok: false, status: 403 as const, message: "No autorizado" }
        }

        if (!["ADMIN", "RECLUTADOR"].includes(user.rol as "ADMIN" | "RECLUTADOR")) {
            return { ok: false, status: 403 as const, message: "No autorizado" }
        }

        const json = await req.json()
        const { estado } = BodySchema.parse(json)

        const { id } = await params

        const updated = await prisma.postulacion.update({
            where: { id },
            data: { estado },
            select: {
                id: true,
                estado: true,
                oferta: { select: { puesto: true } },
                perfil: {
                    select: {
                        usuario: {
                            select: {
                                email: true,
                                persona: { select: { nombre: true, apellido: true } }, // ← si tu relación existe
                            },
                        },
                    },
                },
            },
        })

        const correo = updated.perfil.usuario.email
        const nombre =
            updated.perfil.usuario.persona
                ? `${updated.perfil.usuario.persona.nombre} ${updated.perfil.usuario.persona.apellido}`
                : "Candidato"
        const puesto = updated.oferta.puesto

        // Enviar (no bloquees errores del correo; registra y sigue)
        try {
            await sendEstadoPostulacionEmail({
                to: correo,
                nombre,
                puesto,
                estadoNuevo: updated.estado as
                    | "SOLICITUD" | "ENTREVISTA" | "EVALUACIONES" | "CONTRATACION" | "RECHAZADA",
            })
        } catch (err) {
            console.error("[Email estado postulacion] Error:", err)
            // Puedes guardar un log/flag para reintentar luego si te interesa
        }

        return NextResponse.json(updated)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Datos inválidos", errors: error.flatten() },
                { status: 400 }
            );
        }
        return NextResponse.json({ message: "Error al actualizar estado" }, { status: 500 })
    }
}
