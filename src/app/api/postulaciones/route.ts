import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET() {
    try {

        const postulaciones = await prisma.postulacion.findMany({
            include: {
                perfil: {
                    select: {
                        usuarioId: true,
                        usuario: {
                            select: {
                                persona: {
                                    select: {
                                        nombre: true,
                                        apellido: true,
                                    },
                                },
                            },
                        },
                    },
                },
                oferta: {
                    select: {
                        id: true,
                        puesto: true,
                        empresa: true,
                        modalidad: true,
                        tipoTrabajo: true,
                        ubicacionCiudad: true,
                        ubicacionDepartamento: true,
                    },
                },
            },
        });

        return NextResponse.json({ postulaciones });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Error al obtener postulaciones" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ message: "No autenticado" }, { status: 401 });
        }

        const { ofertaId } = await req.json();
        if (!ofertaId || typeof ofertaId !== "string") {
            return NextResponse.json({ message: "ofertaId es requerido" }, { status: 400 });
        }

        const perfil = await prisma.perfilCandidato.findUnique({
            where: { usuarioId: session.user.id },
            select: { id: true, cvUrl: true, cvKey: true },
        });

        if (!perfil) {
            return NextResponse.json({ message: "El usuario no tiene perfil de candidato" }, { status: 400 });
        }

        const yaExiste = await prisma.postulacion.findUnique({
            where: {
                ofertaLaboralId_perfilCandidatoId: {
                    ofertaLaboralId: ofertaId,
                    perfilCandidatoId: perfil.id,
                },
            },
        });

        if (yaExiste) {
            return NextResponse.json({ message: "Ya aplicaste a esta oferta" }, { status: 409 });
        }

        const nueva = await prisma.postulacion.create({
            data: {
                ofertaLaboralId: ofertaId,
                perfilCandidatoId: perfil.id,
                //cartaPresentacion: cartaPresentacion?.trim() || null,
                cvSnapshotUrl: perfil.cvUrl,
                cvSnapshotKey: perfil.cvKey,
            },
        });

        return NextResponse.json({ message: "Postulación enviada", postulacion: nueva }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Error al postular" }, { status: 500 });
    }
}
