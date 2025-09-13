import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ message: "No autenticado" }, { status: 401 });
        }

        // buscar el perfil del candidato
        const perfil = await prisma.perfilCandidato.findUnique({
            where: { usuarioId: session.user.id },
            select: { id: true },
        });
        if (!perfil) {
            return NextResponse.json({ message: "No tiene perfil de candidato" }, { status: 400 });
        }

        // Postulaciones del perfil
        const postulaciones = await prisma.postulacion.findMany({
            where: { perfilCandidatoId: perfil.id },
            orderBy: { fechaPostulacion: "desc" },
            include: {
                oferta: {
                    select: {
                        id: true, puesto: true, empresa: true,
                        modalidad: true, tipoTrabajo: true,
                        ubicacionDepartamento: {
                            select: {
                                nombre: true,
                            },
                        },
                        ubicacionCiudad: {
                            select: {
                                nombre: true,
                            },
                        },
                    }
                }
            }
        });

        return NextResponse.json({ postulaciones });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Error al listar postulaciones" }, { status: 500 });
    }
}
