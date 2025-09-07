import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }
) {
    try {
        const { id } = await params
        const candidato = await prisma.perfilCandidato.findUnique({
            where: { id },
            include: {
                usuario: {
                    include: {
                        persona: true,
                    },
                },
            },
        })

        if (!candidato) {
            return NextResponse.json({ message: "Candidato no encontrado" }, { status: 404 })
        }

        return NextResponse.json(candidato)
    } catch (error) {
        console.error("Error al obtener empleado:", error)
        return NextResponse.json({ message: "Error del servidor" }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params

        const candidato = await prisma.perfilCandidato.findUnique({
            where: { id },
            include: {
                usuario: {
                    select: {
                        personaId: true,
                    },
                },
            },
        });

        if (!candidato) {
            return NextResponse.json(
                { message: "Candidato no encontrado" },
                { status: 404 }
            );
        }

        await prisma.persona.delete({
            where: { id: candidato.usuario.personaId },
        });

        return NextResponse.json(
            { message: "Candidato eliminado correctamente" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error eliminando candidato:", error);
        return NextResponse.json(
            { message: "Error interno al eliminar el candidato" },
            { status: 500 }
        );
    }
}