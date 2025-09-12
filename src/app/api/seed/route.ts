import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RolUsuario } from "@prisma/client";

// Helpers: crean si no existen y devuelven el id
async function getOrCreateDepartamento(descripcion: string) {
    const existing = await prisma.departamento.findFirst({ where: { descripcion }, select: { id: true } });
    if (existing) return existing.id;
    const created = await prisma.departamento.create({ data: { descripcion } });
    return created.id;
}

async function getOrCreateCargo(descripcion: string) {
    const existing = await prisma.cargo.findFirst({ where: { descripcion }, select: { id: true } });
    if (existing) return existing.id;
    const created = await prisma.cargo.create({ data: { descripcion } });
    return created.id;
}

export async function GET() {
    try {
        // Datos de prueba
        const personasData = [
            {
                nombre: "Allan",
                apellido: "Hernandez",
                telefono: "95560225",
                direccion: "Calle 1",
                fechaNacimiento: new Date("1990-01-01"),
                usuario: {
                    email: "allan_hc@outlook.com",
                    password: "12345678",
                    rol: RolUsuario.ADMIN,
                },
                empleado: {
                    departamento: "Recursos Humanos",
                    cargo: "Coordinador de Reclutamiento",
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
                    password: "12345678",
                    rol: RolUsuario.RECLUTADOR,
                },
                empleado: {
                    departamento: "Recursos Humanos",
                    cargo: "Oficial de Reclutamiento",
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
                    password: "12345678",
                    rol: RolUsuario.RECLUTADOR,
                },
                empleado: {
                    departamento: "Recursos Humanos",
                    cargo: "Oficial de Reclutamiento",
                },
            },
        ];

        const resultados = [];

        // Pre-crear/asegurar catálogos requeridos (evita carreras y repeticiones)
        const deptoSet = new Set(personasData.map(p => p.empleado.departamento));
        const cargoSet = new Set(personasData.map(p => p.empleado.cargo));

        const deptoMap = new Map<string, number>();
        for (const d of deptoSet) {
            const id = await getOrCreateDepartamento(d);
            deptoMap.set(d, id);
        }

        const cargoMap = new Map<string, number>();
        for (const c of cargoSet) {
            const id = await getOrCreateCargo(c);
            cargoMap.set(c, id);
        }

        for (const p of personasData) {
            // Verificar si ya existe un usuario con ese email
            const existe = await prisma.usuario.findUnique({
                where: { email: p.usuario.email },
                include: { persona: true, empleado: true },
            });

            if (existe) {
                resultados.push({ mensaje: `Usuario ${p.usuario.email} ya existe`, data: existe });
                continue;
            }

            // Hashear password
            const passwordHash = await bcrypt.hash(p.usuario.password, 10);

            // Mapear IDs normalizados
            const departamentoId = deptoMap.get(p.empleado.departamento)!;
            const cargoId = cargoMap.get(p.empleado.cargo)!;

            // Crear persona con usuario y empleado (usando IDs)
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
                            activo: true,
                            empleado: {
                                create: {
                                    departamentoId,
                                    cargoId,
                                },
                            },
                        },
                    },
                },
                include: {
                    usuario: {
                        include: {
                            empleado: {
                                include: {
                                    departamento: true,
                                    cargo: true,
                                },
                            },
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
