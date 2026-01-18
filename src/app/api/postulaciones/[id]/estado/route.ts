// src/app/api/postulaciones/[id]/estado/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { z } from "zod";
import { sendEstadoPostulacionEmail } from "@/lib/mailer";

export const runtime = "nodejs";

type Params = { id: string };

type Estado = "SOLICITUD" | "ENTREVISTA" | "EVALUACIONES" | "CONTRATACION" | "RECHAZADA";

const EstadoEnum = z.enum([
  "SOLICITUD",
  "ENTREVISTA",
  "EVALUACIONES",
  "CONTRATACION",
  "RECHAZADA",
]);
const BodySchema = z.object({ estado: EstadoEnum });

const ORDER: Record<Exclude<Estado, "RECHAZADA">, number> = {
  SOLICITUD: 0,
  ENTREVISTA: 1,
  EVALUACIONES: 2,
  CONTRATACION: 3,
};

function isFinalEstado(estado: Estado) {
  return estado === "CONTRATACION" || estado === "RECHAZADA";
}

function canTransition(current: Estado, next: Estado) {
  if (current === next) return true;
  if (isFinalEstado(current)) return false;
  if (next === "RECHAZADA") return true; // permitido desde cualquier etapa no-final

  // next es parte del flujo normal
  const currentRank = ORDER[current as Exclude<Estado, "RECHAZADA">];
  const nextRank = ORDER[next as Exclude<Estado, "RECHAZADA">];
  return nextRank >= currentRank;
}

export async function PATCH(req: Request, ctx: { params: Promise<Params> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    const user = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: { rol: true, activo: true },
    });

    if (!user || !user.activo) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    if (!(["ADMIN", "RECLUTADOR"] as const).includes(user.rol as "ADMIN" | "RECLUTADOR")) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const json = await req.json();
    const { estado } = BodySchema.parse(json);

    const { id } = await ctx.params;

    const current = await prisma.postulacion.findUnique({
      where: { id },
      select: { estado: true, notasInternas: true },
    });


    if (!current) {
      return NextResponse.json({ message: "Postulación no encontrada" }, { status: 404 });
    }

    const currentEstado = current.estado as Estado;

    if (!canTransition(currentEstado, estado)) {
      const message = isFinalEstado(currentEstado)
        ? "La postulación está en un estado final y no se puede modificar."
        : "No se permite retroceder el estado de la postulación.";

      return NextResponse.json(
        { code: "ESTADO_NO_PERMITIDO", message, current: currentEstado, attempted: estado },
        { status: 409 }
      );
    }

    // No-op (evita enviar correo / tocar updatedAt)
    if (estado === currentEstado) {
      return NextResponse.json({ id, estado: currentEstado });
    }

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
                persona: { select: { nombre: true, apellido: true } },
              },
            },
          },
        },
      },
    });

    await prisma.postulacionHistorial.create({
      data: {
        postulacionId: id,
        estadoAnterior: currentEstado,
        estadoNuevo: estado,
        notasInternas: current.notasInternas ?? null,
        cambiadoPorId: session.user.id,
      },
    });


    const correo = updated.perfil.usuario.email;
    const nombre = updated.perfil.usuario.persona
      ? `${updated.perfil.usuario.persona.nombre} ${updated.perfil.usuario.persona.apellido}`
      : "Candidato";
    const puesto = updated.oferta.puesto;

    try {
      await sendEstadoPostulacionEmail({
        to: correo,
        nombre,
        puesto,
        estadoNuevo: updated.estado as Estado,
      });
    } catch (err) {
      console.error("[Email estado postulacion] Error:", err);
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Datos inválidos", errors: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Error al actualizar estado" }, { status: 500 });
  }
}
