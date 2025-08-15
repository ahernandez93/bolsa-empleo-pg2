// app/api/empleados/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const departamentoSchema = z.object({
    descripcion: z.string().min(2, "La descripción debe tener al menos 2 caracteres"),
    habilitado: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const data = departamentoSchema.parse(body);


        const departamento = await prisma.departamento.create({
            data: {
                descripcion: data.descripcion,
                habilitado: data.habilitado,
            },
        });

        return NextResponse.json(
            {
                message: "Departamento creado correctamente", departamento: {
                    descripcion: departamento.descripcion,
                    habilitado: departamento.habilitado
                }
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error al crear departamento:", error);

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
        const departamentos = await prisma.departamento.findMany({
            select: {
                id: true,
                descripcion: true,
                habilitado: true,
            },
        });

        const data = departamentos.map(emp => ({
            id: emp.id,
            descripcion: emp.descripcion,
            habilitado: emp.habilitado,
        }))

        return NextResponse.json({ departamentos: data });
    } catch (error) {
        console.error("Error al obtener departamentos:", error);
        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

