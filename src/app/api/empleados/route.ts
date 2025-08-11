// app/api/empleados/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const empleadoSchema = z.object({
    nombre: z.string().min(2),
    apellido: z.string().min(2),
    telefono: z.string().optional(),
    direccion: z.string().optional(),
    fechaNacimiento: z.string().optional(), // formato ISO (yyyy-mm-dd)
    email: z.string().email(),
    password: z.string().min(6),
    rol: z.enum(["RECLUTADOR", "ADMIN"]), // solo roles válidos para empleados
    activo: z.boolean().optional().default(true),
    emailVerificado: z.boolean().optional().default(false),
    departamento: z.string().min(2),
    cargo: z.string().min(2),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const data = empleadoSchema.parse(body);

        const passwordHash = await bcrypt.hash(data.password, 10);

        const persona = await prisma.persona.create({
            data: {
                nombre: data.nombre,
                apellido: data.apellido,
                telefono: data.telefono,
                direccion: data.direccion,
                fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : undefined,
                usuario: {
                    create: {
                        email: data.email,
                        passwordHash,
                        rol: data.rol,
                        activo: true,
                        emailVerificado: false,
                        empleado: {
                            create: {
                                departamento: data.departamento,
                                cargo: data.cargo,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json(
            {
                message: "Empleado creado correctamente", empleado: {
                    persona
                }
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error al crear empleado:", error);

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
        const empleados = await prisma.empleado.findMany({
            include: {
                usuario: {
                    include: {
                        persona: true,
                    },
                },
            },
        });

        const data = empleados.map(emp => ({
            id: emp.id,
            nombre: emp.usuario.persona.nombre,
            apellido: emp.usuario.persona.apellido,
            email: emp.usuario.email,
            telefono: emp.usuario.persona.telefono,
            rol: emp.usuario.rol,
            departamento: emp.departamento,
            cargo: emp.cargo,
            activo: emp.usuario.activo,
            createdAt: emp.createdAt,
        }))

        return NextResponse.json({ empleados: data });
    } catch (error) {
        console.error("Error al obtener empleados:", error);
        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

