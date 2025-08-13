import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RolUsuario } from "@prisma/client";

export async function GET() {
    try {
        // Datos de prueba
        const personasData = [
            {
                nombre: "Juan",
                apellido: "Pérez",
                telefono: "123456789",
                direccion: "Calle 1",
                fechaNacimiento: new Date("1990-01-01"),
                usuario: {
                    email: "juan@example.com",
                    password: "123456",
                    rol: RolUsuario.ADMIN,
                },
                empleado: {
                    departamento: "Recursos Humanos",
                    cargo: "Coordinador",
                },
            },
            {
                nombre: "María",
                apellido: "García",
                telefono: "987654321",
                direccion: "Calle 2",
                fechaNacimiento: new Date("1995-05-15"),
                usuario: {
                    email: "maria@example.com",
                    password: "123456",
                    rol: RolUsuario.RECLUTADOR,
                },
                empleado: {
                    departamento: "Recursos Humanos",
                    cargo: "Reclutadora",
                },
            },
            {
                nombre: "Pedro",
                apellido: "López",
                telefono: "555666777",
                direccion: "Calle 3",
                fechaNacimiento: new Date("1998-09-20"),
                usuario: {
                    email: "pedro@example.com",
                    password: "123456",
                    rol: RolUsuario.RECLUTADOR,
                },
                empleado: {
                    departamento: "Recursos Humanos",
                    cargo: "Reclutador",
                },
            },
        ];

        const resultados = [];

        for (const p of personasData) {
            // Verificar si ya existe un usuario con ese email
            const existe = await prisma.usuario.findUnique({
                where: { email: p.usuario.email },
                include: { persona: true, empleado: true },
            });

            if (existe) {
                resultados.push({ mensaje: `Usuario ${p.usuario.email} ya existe`, data: existe });
                continue; // saltar creación
            }

            // Hashear password
            const passwordHash = await bcrypt.hash(p.usuario.password, 10);

            // Crear persona con usuario y empleado
            const personaCreada = await prisma.persona.create({
                data: {
                    nombre: p.nombre,
                    apellido: p.apellido,
                    telefono: p.telefono,
                    direccion: p.direccion,
                    fechaNacimiento: p.fechaNacimiento,
                    usuario: {
                        create: {
                            email: p.usuario.email,
                            passwordHash,
                            rol: p.usuario.rol,
                            emailVerificado: true,
                            empleado: {
                                create: {
                                    departamento: p.empleado.departamento,
                                    cargo: p.empleado.cargo,
                                },
                            },
                        },
                    },
                },
                include: {
                    usuario: {
                        include: {
                            empleado: true,
                        },
                    },
                },
            });

            resultados.push({ mensaje: `Usuario ${p.usuario.email} creado`, data: personaCreada });
        }

        return NextResponse.json({
            message: "Seed ejecutado",
            resultados,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Error ejecutando el seed" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
