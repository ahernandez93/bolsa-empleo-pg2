import { prisma } from "@/lib/prisma"
import { cargoSchema } from "@/lib/schemas/cargoSchema"
import { NextResponse } from "next/server"
import z from "zod"
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

type Params = { id: string };

export async function GET(request: Request, ctx : { params: Promise<Params> }) {
    try {
        const { id } = await ctx.params
        const cargo = await prisma.cargo.findUnique({
            where: { id: parseInt(id) },
        })

        if (!cargo) {
            return NextResponse.json({ message: "Cargo no encontrado" }, { status: 404 })
        }

        return NextResponse.json(cargo)
    } catch (error) {
        console.error("Error al obtener cargo:", error)
        return NextResponse.json({ message: "Error del servidor" }, { status: 500 })
    }
}

export async function PUT(request: Request, ctx : { params: Promise<Params> }) {
    try {
        const { id } = await ctx.params
        const body = await request.json()
        const validatedData = cargoSchema.parse(body)

        const existingCargo = await prisma.cargo.findUnique({
            where: { id: parseInt(id) },
        })

        if (!existingCargo) {
            return NextResponse.json({ message: "Cargo no encontrado" }, { status: 404 })
        }


        const cargoUpdateData: Prisma.CargoUpdateInput = {
            descripcion: validatedData.descripcion,
            habilitado: validatedData.habilitado,
        }

        const updatedCargo = await prisma.cargo.update({
            where: { id: parseInt(id) },
            data: cargoUpdateData,
        })

        return NextResponse.json(updatedCargo)
    } catch (error) {
        console.error("Error al actualizar cargo:", error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Datos inválidos", errors: error.flatten() },
                { status: 400 }
            )
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return NextResponse.json(
                    { message: "Cargo no encontrado" },
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

        const cargo = await prisma.cargo.findUnique({
            where: { id: parseInt(id) },
        });

        if (!cargo) {
            return NextResponse.json(
                { message: "Cargo no encontrado" },
                { status: 404 }
            );
        }

        await prisma.cargo.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json(
            { message: "Cargo eliminado correctamente" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error eliminando cargo:", error);
        return NextResponse.json(
            { message: "Error interno al eliminar el cargo" },
            { status: 500 }
        );
    }
}