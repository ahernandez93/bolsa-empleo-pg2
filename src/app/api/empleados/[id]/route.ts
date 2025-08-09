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
        const { id } = await params
        const body = await request.json()
        const validatedData = empleadoUpdateSchema.parse(body)

        const existingEmpleado = await prisma.empleado.findUnique({
            where: { id },
            include: {
                usuario: true
            }
        })

        if (!existingEmpleado) {
            return NextResponse.json({ message: "Empleado no encontrado" }, { status: 404 })
        }

        if (validatedData.email !== existingEmpleado.usuario.email) {
            const emailExists = await prisma.usuario.findUnique({
                where: { email: validatedData.email }
            })

            if (emailExists) {
                return NextResponse.json(
                    { message: "El email ya está en uso por otro usuario" },
                    { status: 409 }
                )
            }
        }

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
            where: { id },
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

        // Manejo específico de errores de Prisma
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return NextResponse.json(
                    { message: "El email ya está en uso" },
                    { status: 409 }
                )
            }
            if (error.code === 'P2025') {
                return NextResponse.json(
                    { message: "Empleado no encontrado" },
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

        const empleado = await prisma.empleado.findUnique({
            where: { id },
        });

        if (!empleado) {
            return NextResponse.json(
                { message: "Empleado no encontrado" },
                { status: 404 }
            );
        }

        await prisma.empleado.delete({
            where: { id },
        });

        return NextResponse.json(
            { message: "Empleado eliminado correctamente" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error eliminando empleado:", error);
        return NextResponse.json(
            { message: "Error interno al eliminar el empleado" },
            { status: 500 }
        );
    }
}