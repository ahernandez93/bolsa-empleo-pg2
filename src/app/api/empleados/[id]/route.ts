import { prisma } from "@/lib/prisma"
import { empleadoUpdateSchema } from "@/lib/schemas/empleadoSchema"
import { NextResponse } from "next/server"
import z from "zod"
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

export async function GET(request: Request, { params }: { params: { id: string } }
) {
    try {
        const { id } = await params
        const empleado = await prisma.empleado.findUnique({
            where: { id },
            include: {
                usuario: {
                    include: {
                        persona: true,
                    },
                },
            },
        })

        if (!empleado) {
            return NextResponse.json({ message: "Empleado no encontrado" }, { status: 404 })
        }

        return NextResponse.json(empleado)
    } catch (error) {
        console.error("Error al obtener empleado:", error)
        return NextResponse.json({ message: "Error del servidor" }, { status: 500 })
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json()
        const validatedData = empleadoUpdateSchema.parse(body)

        const usuarioUpdateData: Prisma.UsuarioUpdateInput = {
            email: validatedData.email,
            rol: validatedData.rol,
            persona: {
                update: {
                    nombre: validatedData.nombre,
                    apellido: validatedData.apellido,
                    telefono: validatedData.telefono,
                    direccion: validatedData.direccion,
                    fechaNacimiento: validatedData.fechaNacimiento ? new Date(validatedData.fechaNacimiento) : undefined,
                },
            },
        }

        if (validatedData.password && validatedData.password.trim() !== "") {
            usuarioUpdateData.passwordHash = await bcrypt.hash(validatedData.password, 10)
        }

        const updatedEmpleado = await prisma.empleado.update({
            where: { id: params.id },
            data: {
                departamento: validatedData.departamento,
                cargo: validatedData.cargo,
                usuario: {
                    update: usuarioUpdateData,
                },
            },
            include: {
                usuario: {
                    include: {
                        persona: true,
                    },
                },
            },
        })

        return NextResponse.json(updatedEmpleado)
    } catch (error) {
        console.error("Error al actualizar empleado:", error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Datos inválidos", errors: error.flatten() },
                { status: 400 }
            )
        }

        return NextResponse.json({ message: "Error del servidor" }, { status: 500 })
    }
}