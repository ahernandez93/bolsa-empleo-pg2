import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ message: "No autenticado" }, { status: 401 });
        }

        const body = await req.json();
        const { accion } = body as { accion: "RETIRAR" };

        // asegurar que la postulación es del candidato logueado
        const postulacion = await prisma.postulacion.findUnique({
            where: { id: params.id },
            include: {
                perfil: { select: { usuarioId: true } }
            }
        });

        if (!postulacion) {
            return NextResponse.json({ message: "Postulación no encontrada" }, { status: 404 });
        }
        if (postulacion.perfil.usuarioId !== session.user.id) {
            return NextResponse.json({ message: "No autorizado" }, { status: 403 });
        }

        // lógica de retirada (solo si no está ya cerrada)
        if (accion === "RETIRAR") {
            // estados que ya no tiene sentido retirar
            const noRetirable = ["ACEPTADA", "OFERTA", "RECHAZADA"];
            if (noRetirable.includes(postulacion.estado)) {
                return NextResponse.json({ message: "No se puede retirar en este estado" }, { status: 400 });
            }

            const updated = await prisma.postulacion.update({
                where: { id: params.id },
                data: { estado: "RECHAZADA" } // enum EstadoPostulacion cambiar a RETIRADA
            });

            return NextResponse.json({ message: "Postulación retirada", postulacion: updated });
        }

        return NextResponse.json({ message: "Acción no soportada" }, { status: 400 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Error al actualizar postulación" }, { status: 500 });
    }
}
