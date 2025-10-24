import { prisma } from "@/lib/prisma"
import { ofertaLaboralUpdateSchema } from "@/lib/schemas/ofertaLaboralSchema"
import { NextResponse } from "next/server"
import z from "zod"
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth/auth";

export const dynamic = 'force-dynamic';
export const runtime = "nodejs";

type Params = { id: string };

export async function GET(request: Request, ctx : { params: Promise<Params> }) {
    try {
        const { id } = await ctx.params
        const ofertaLaboral = await prisma.ofertaLaboral.findUnique({
            where: { id },
            select: {
                id: true,
                puesto: true,
                descripcionPuesto: true,
                area: true,
                nivelAcademico: true,
                experienciaLaboral: true,
                modalidad: true,
                tipoTrabajo: true,
                salario: true,
                estado: true,
                fechaCreacion: true,
                empresa: { select: { nombre: true } },
                ubicacionCiudadId: true,
                ubicacionDepartamentoId: true,
                ubicacionCiudad: { select: { nombre: true } },
                ubicacionDepartamento: { select: { nombre: true } },
            },
        })

        if (!ofertaLaboral) {
            return NextResponse.json({ message: "Oferta laboral no encontrada" }, { status: 404 })
        }

        const dto = {
            id: ofertaLaboral.id,
            puesto: ofertaLaboral.puesto,
            descripcionPuesto: ofertaLaboral.descripcionPuesto,
            area: ofertaLaboral.area,
            nivelAcademico: ofertaLaboral.nivelAcademico,
            experienciaLaboral: ofertaLaboral.experienciaLaboral,
            modalidad: ofertaLaboral.modalidad,
            tipoTrabajo: ofertaLaboral.tipoTrabajo,
            salario: ofertaLaboral.salario,
            estado: ofertaLaboral.estado,
            fechaCreacion: ofertaLaboral.fechaCreacion?.toISOString?.() ?? ofertaLaboral.fechaCreacion,
            empresa: ofertaLaboral.empresa?.nombre ?? "", // ← string
            ubicacionCiudadId: ofertaLaboral.ubicacionCiudadId,
            ubicacionDepartamentoId: ofertaLaboral.ubicacionDepartamentoId,
            ubicacionCiudadDescripcion: ofertaLaboral.ubicacionCiudad?.nombre ?? null,
            ubicacionDepartamentoDescripcion: ofertaLaboral.ubicacionDepartamento?.nombre ?? null,
        };

        return NextResponse.json(dto)
    } catch (error) {
        console.error("Error al obtener oferta laboral:", error)
        return NextResponse.json({ message: "Error del servidor" }, { status: 500 })
    }
}

export async function PUT(request: Request, ctx : { params: Promise<Params> }) {
    try {
        const { id } = await ctx.params
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
            ubicacionDepartamento: { connect: { id: validatedData.ubicacionDepartamentoId } },
            ubicacionCiudad: { connect: { id: validatedData.ubicacionCiudadId } },
            //empresa: validatedData.empresa,
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

export async function DELETE(request: Request, ctx : { params: Promise<Params> }) {
    try {
        const { id } = await ctx.params

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