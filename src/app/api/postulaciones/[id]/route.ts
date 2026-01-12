import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { postulacionFormSchema } from "@/lib/schemas/postulacionSchema";
import { sendEstadoPostulacionEmail } from "@/lib/mailer";
import z from "zod";

export const runtime = "nodejs";

type Params = { id: string };

type Estado = "SOLICITUD" | "ENTREVISTA" | "EVALUACIONES" | "CONTRATACION" | "RECHAZADA";

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
  if (next === "RECHAZADA") return true;

  const currentRank = ORDER[current as Exclude<Estado, "RECHAZADA">];
  const nextRank = ORDER[next as Exclude<Estado, "RECHAZADA">];
  return nextRank >= currentRank;
}

export async function GET(req: Request, ctx: { params: Promise<Params> }) {
  try {
    const { id } = await ctx.params;
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
    });

    if (!p) {
      return NextResponse.json({ message: "Postulación no encontrada" }, { status: 404 });
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
    };

    return NextResponse.json(initialData);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Error cargando postulación" }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<Params> }) {
  try {
    const { id } = await ctx.params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: { rol: true },
    });
    if (!usuario || !["ADMIN", "RECLUTADOR"].includes(usuario.rol)) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const current = await prisma.postulacion.findUnique({
      where: { id },
      select: { estado: true },
    });

    if (!current) {
      return NextResponse.json({ message: "Postulación no encontrada" }, { status: 404 });
    }

    const currentEstado = current.estado as Estado;

    if (isFinalEstado(currentEstado)) {
      return NextResponse.json(
        {
          code: "POSTULACION_BLOQUEADA",
          message: "La postulación está en un estado final y no se puede modificar.",
          current: currentEstado,
        },
        { status: 409 }
      );
    }

    const body = await req.json();
    const { estado, notasInternas } = postulacionFormSchema.parse(body);

    const estadoChanged = (estado as Estado) !== currentEstado;

    if (!canTransition(currentEstado, estado as Estado)) {
      return NextResponse.json(
        {
          code: "ESTADO_NO_PERMITIDO",
          message: "No se permite retroceder el estado de la postulación.",
          current: currentEstado,
          attempted: estado,
        },
        { status: 409 }
      );
    }

    const updated = await prisma.postulacion.update({
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

    if (estadoChanged) {
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
    }

    const postulacion = {
      id: updated.id,
      estado: updated.estado,
      notasInternas: updated.notasInternas,
      fechaActualizacion: updated.fechaActualizacion,
    };

    return NextResponse.json({ message: "Postulación actualizada", postulacion });
  } catch (err) {
    console.error("[PATCH /postulaciones/:id] error:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Datos inválidos", errors: err.flatten() },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Error al actualizar la postulación" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<Params> }) {
  try {
    const { id } = await ctx.params;

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
