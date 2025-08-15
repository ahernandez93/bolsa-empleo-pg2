import { prisma } from "@/lib/prisma"
import { departamentoSchema } from "@/lib/schemas/departamentoSchema"
import { NextResponse } from "next/server"
import z from "zod"
import { Prisma } from "@prisma/client";

export async function GET(request: Request, { params }: { params: { id: number } }
) {
    try {
        const { id } = await params
        const departamento = await prisma.departamento.findUnique({
            where: { id },
        })

        if (!departamento) {
            return NextResponse.json({ message: "Departamento no encontrado" }, { status: 404 })
        }

        return NextResponse.json(departamento)
    } catch (error) {
        console.error("Error al obtener empleado:", error)
        return NextResponse.json({ message: "Error del servidor" }, { status: 500 })
    }
}

export async function PUT(request: Request, { params }: { params: { id: number } }) {
    try {
        const { id } = await params
        const body = await request.json()
        const validatedData = departamentoSchema.parse(body)

        const existingDepartamento = await prisma.departamento.findUnique({
            where: { id },
        })

        if (!existingDepartamento) {
            return NextResponse.json({ message: "Departamento no encontrado" }, { status: 404 })
        }


        const departamentoUpdateData: Prisma.DepartamentoUpdateInput = {
            descripcion: validatedData.descripcion,
            habilitado: validatedData.habilitado,
        }

        const updatedDepartamento = await prisma.departamento.update({
            where: { id },
            data: departamentoUpdateData,
        })

        return NextResponse.json(updatedDepartamento)
    } catch (error) {
        console.error("Error al actualizar departamento:", error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Datos inválidos", errors: error.flatten() },
                { status: 400 }
            )
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return NextResponse.json(
                    { message: "Departamento no encontrado" },
                    { status: 404 }
                )
            }
        }

        return NextResponse.json({ message: "Error del servidor" }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: { id: number } }) {
    try {
        const { id } = await params

        const departamento = await prisma.departamento.findUnique({
            where: { id },
        });

        if (!departamento) {
            return NextResponse.json(
                { message: "Departamento no encontrado" },
                { status: 404 }
            );
        }

        await prisma.departamento.delete({
            where: { id },
        });

        return NextResponse.json(
            { message: "Departamento eliminado correctamente" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error eliminando departamento:", error);
        return NextResponse.json(
            { message: "Error interno al eliminar el departamento" },
            { status: 500 }
        );
    }
}