import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { cargoSchema } from "@/lib/schemas/cargoSchema";


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const data = cargoSchema.parse(body);


        const cargo = await prisma.cargo.create({
            data: {
                descripcion: data.descripcion,
                habilitado: data.habilitado,
            },
        });

        return NextResponse.json(
            {
                message: "Cargo creado correctamente", cargo: {
                    descripcion: cargo.descripcion,
                    habilitado: cargo.habilitado
                }
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error al crear cargo:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Datos inválidos", errors: error.flatten() },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const cargos = await prisma.cargo.findMany({
            select: {
                id: true,
                descripcion: true,
                habilitado: true,
            },
        });

        const data = cargos.map(emp => ({
            id: emp.id,
            descripcion: emp.descripcion,
            habilitado: emp.habilitado,
        }))

        return NextResponse.json({ cargos: data });
    } catch (error) {
        console.error("Error al obtener cargos:", error);
        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

