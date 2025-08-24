import { prisma } from "@/lib/prisma"
import { ofertaLaboralUpdateSchema } from "@/lib/schemas/ofertaLaboralSchema"
import { NextResponse } from "next/server"
import z from "zod"
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth/auth";

export async function GET(request: Request, { params }: { params: { id: string } }
) {
    try {
        const { id } = await params
        const ofertaLaboral = await prisma.ofertaLaboral.findUnique({
            where: { id },
        })

        if (!ofertaLaboral) {
            return NextResponse.json({ message: "Oferta laboral no encontrada" }, { status: 404 })
        }

        return NextResponse.json(ofertaLaboral)
    } catch (error) {
        console.error("Error al obtener oferta laboral:", error)
        return NextResponse.json({ message: "Error del servidor" }, { status: 500 })
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params
        const session = await auth();
        const actualizadoPorId = session?.user?.id;
        const body = await request.json()
        const validatedData = ofertaLaboralUpdateSchema.parse(body)

        const existingOfertaLaboral = await prisma.ofertaLaboral.findUnique({
            where: { id },
        })

        if (!existingOfertaLaboral) {
            return NextResponse.json({ message: "Oferta laboral no encontrada" }, { status: 404 })
        }

        const ofertaLaboralUpdateData: Prisma.OfertaLaboralUpdateInput = {
            puesto: validatedData.puesto,
            descripcionPuesto: validatedData.descripcionPuesto,
            area: validatedData.area,
            ubicacionPais: validatedData.ubicacionPais,
            ubicacionDepartamento: validatedData.ubicacionDepartamento,
            ubicacionCiudad: validatedData.ubicacionCiudad,
            empresa: validatedData.empresa,
            nivelAcademico: validatedData.nivelAcademico,
            experienciaLaboral: validatedData.experienciaLaboral,
            tipoTrabajo: validatedData.tipoTrabajo,
            modalidad: validatedData.modalidad,
            salario: validatedData.salario,
            estado: validatedData.estado,
            ...(actualizadoPorId
                ? { actualizadoPor: { connect: { id: actualizadoPorId } } }
                : {}),
        }

        const updatedOfertaLaboral = await prisma.ofertaLaboral.update({
            where: { id },
            data: ofertaLaboralUpdateData,
        })

        return NextResponse.json(updatedOfertaLaboral)
    } catch (error) {
        console.error("Error al actualizar oferta laboral:", error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Datos inválidos", errors: error.flatten() },
                { status: 400 }
            )
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return NextResponse.json(
                    { message: "Oferta laboral no encontrada" },
                    { status: 404 }
                )
            }
        }

        return NextResponse.json({ message: "Error del servidor" }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params

        const ofertaLaboral = await prisma.ofertaLaboral.findUnique({
            where: { id },
        });

        if (!ofertaLaboral) {
            return NextResponse.json(
                { message: "Oferta laboral no encontrada" },
                { status: 404 }
            );
        }

        await prisma.ofertaLaboral.delete({
            where: { id },
        });

        return NextResponse.json(
            { message: "Oferta laboral eliminada correctamente" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error eliminando oferta laboral:", error);
        return NextResponse.json(
            { message: "Error interno al eliminar la oferta laboral" },
            { status: 500 }
        );
    }
}