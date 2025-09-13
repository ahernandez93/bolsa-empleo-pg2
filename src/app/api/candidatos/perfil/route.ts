// app/api/perfil-candidato/me/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import z from "zod";

export async function GET() {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) {
            return NextResponse.json({ message: "No autenticado" }, { status: 401 });
        }

        // Perfil por usuarioId (PerfilCandidato.usuarioId es unique)
        const perfil = await prisma.perfilCandidato.findUnique({
            where: { usuarioId: userId },
            include: {
                usuario: {
                    include: {
                        persona: {
                            include: {
                                ubicacionDepartamento: { select: { id: true, nombre: true } },
                                ubicacionCiudad: { select: { id: true, nombre: true } },
                            },
                        },
                    },
                },
                habilidades: {
                    include: { habilidad: { select: { id: true, nombre: true } } },
                },
                educacion: true,
                experiencia: true,
            },
        });

        if (!perfil) {
            return NextResponse.json({ message: "Perfil no encontrado" }, { status: 404 });
        }

        return NextResponse.json(perfil);
    } catch (err) {
        console.error("GET /api/perfil-candidato/me", err);
        return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
    }
}

const experienciaItem = z.object({
    empresa: z.string().min(1),
    puesto: z.string().min(1),
    fechaInicio: z.string().min(1),
    fechaFin: z.string().optional(),
    descripcion: z.string().optional(),
});

const educacionItem = z.object({
    institucion: z.string().min(1),
    titulo: z.string().min(1),
    fechaInicio: z.string().min(1),
    fechaFin: z.string().optional(),
});

const perfilUpdateSchema = z.object({
    // Persona + Usuario
    nombre: z.string().min(1),
    apellido: z.string().min(1),
    email: z.string().email(),
    telefono: z.string().optional(),

    // PerfilCandidato
    tituloProfesional: z.string().optional(),
    resumen: z.string().max(600).optional(),

    ubicacionDepartamentoId: z.number().int().positive().optional(),
    ubicacionCiudadId: z.number().int().positive().optional(),

    // Flags (ajústalos si los usas en tu UI)
    disponibilidad: z.string().optional(),
    disponibilidadViajar: z.boolean().optional(),
    cambioResidencia: z.boolean().optional(),
    poseeVehiculo: z.boolean().optional(),

    // Colecciones
    experiencia: z.array(experienciaItem).default([]),
    educacion: z.array(educacionItem).default([]),

    // Skills como strings (nombres)
    skills: z.array(z.string().min(1)).default([]),
});

export async function PUT(req: Request) {
    try {

        // 1) Auth
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) {
            return NextResponse.json({ message: "No autenticado" }, { status: 401 });
        }

        // 2) Parse body
        const body = await req.json();
        const data = perfilUpdateSchema.parse(body);

        // 3) Cargar perfil y verificar autorización (dueño o ADMIN)
        const perfil = await prisma.perfilCandidato.findUnique({
            where: { usuarioId: userId },
            include: {
                usuario: true, // para ver id/rol/email actual
            },
        });

        if (!perfil) {
            return NextResponse.json({ message: "Perfil no encontrado" }, { status: 404 });
        }

        // ¿Es dueño del perfil?
        const isOwner = perfil.usuarioId === session?.user?.id;
        // ¿Es admin?
        const isAdmin = perfil.usuario.rol === "ADMIN";

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ message: "No autorizado" }, { status: 403 });
        }

        // 4) Preparar operaciones dentro de una transacción
        const updated = await prisma.$transaction(async (tx) => {
            // 4.1) Actualizar Persona y Usuario (email)
            // Encontrar usuario vinculado para llegar a persona
            const usuario = await tx.usuario.findUnique({
                where: { id: perfil.usuarioId },
                include: { persona: true },
            });
            if (!usuario) throw new Error("Usuario del perfil no encontrado");

            // Actualizar Persona
            await tx.persona.update({
                where: { id: usuario.personaId },
                data: {
                    nombre: data.nombre,
                    apellido: data.apellido,
                    telefono: data.telefono ?? null,
                    ubicacionDepartamentoId: data.ubicacionDepartamentoId ?? null,
                    ubicacionCiudadId: data.ubicacionCiudadId ?? null,
                },
            });

            // Si cambia el email, actualizar Usuario.email (único)
            if (data.email && data.email !== usuario.email) {
                // Chequear colisión
                const collision = await tx.usuario.findUnique({ where: { email: data.email } });
                if (collision && collision.id !== usuario.id) {
                    throw new Error("El correo ya está en uso por otro usuario");
                }
                await tx.usuario.update({
                    where: { id: usuario.id },
                    data: { email: data.email },
                });
            }

            // 4.2) Actualizar datos base del PerfilCandidato
            await tx.perfilCandidato.update({
                where: { id: perfil.id },
                data: {
                    tituloProfesional: data.tituloProfesional ?? null,
                    resumen: data.resumen ?? null,
                    disponibilidad: data.disponibilidad ?? null,
                    disponibilidadViajar: data.disponibilidadViajar ?? false,
                    cambioResidencia: data.cambioResidencia ?? false,
                    poseeVehiculo: data.poseeVehiculo ?? false,
                },
            });

            // 4.3) Reemplazar experiencia: deleteMany + createMany
            await tx.experienciaLaboral.deleteMany({
                where: { perfilCandidatoId: perfil.id },
            });

            if (data.experiencia.length > 0) {
                await tx.experienciaLaboral.createMany({
                    data: data.experiencia.map((e) => ({
                        perfilCandidatoId: perfil.id,
                        empresa: e.empresa,
                        puesto: e.puesto,
                        descripcion: e.descripcion ?? null,
                        // si luego cambias a Date, conviértelo aquí
                        fechaInicio: new Date(e.fechaInicio),
                        fechaFin: e.fechaFin ? new Date(e.fechaFin) : null,
                    })),
                });
            }

            // 4.4) Reemplazar educación
            await tx.educacion.deleteMany({
                where: { perfilCandidatoId: perfil.id },
            });

            if (data.educacion.length > 0) {
                await tx.educacion.createMany({
                    data: data.educacion.map((ed) => ({
                        perfilCandidatoId: perfil.id,
                        institucion: ed.institucion,
                        titulo: ed.titulo,
                        nivelAcademico: "", // si lo usas, agrega al form/schema
                        fechaInicio: ed.fechaInicio ? new Date(ed.fechaInicio) : null,
                        fechaFin: ed.fechaFin ? new Date(ed.fechaFin) : null,
                    })),
                });
            }

            // 4.5) Sincronizar skills
            //  a) Normalizar nombres (trim) y quitar duplicados vacíos
            const skillNames = Array.from(new Set(data.skills.map((s) => s.trim()).filter(Boolean)));

            //  b) Upsert de habilidades por nombre
            const habilidades = await Promise.all(
                skillNames.map((nombre) =>
                    tx.habilidad.upsert({
                        where: { nombre },
                        update: {},
                        create: { nombre },
                    })
                )
            );
            const habilidadIds = habilidades.map((h) => h.id);

            //  c) Eliminar relaciones que ya no estén
            await tx.perfilCandidatoHabilidad.deleteMany({
                where: {
                    perfilCandidatoId: perfil.id,
                    NOT: { habilidadId: { in: habilidadIds } },
                },
            });

            //  d) Crear las que falten
            // Buscar las existentes para no violar unique
            const existentes = await tx.perfilCandidatoHabilidad.findMany({
                where: { perfilCandidatoId: perfil.id },
                select: { habilidadId: true },
            });
            const existentesSet = new Set(existentes.map((e) => e.habilidadId));
            const faltantes = habilidadIds.filter((hid) => !existentesSet.has(hid));

            if (faltantes.length > 0) {
                await tx.perfilCandidatoHabilidad.createMany({
                    data: faltantes.map((hid) => ({
                        perfilCandidatoId: perfil.id,
                        habilidadId: hid,
                    })),
                });
            }

            // 4.6) Devolver perfil actualizado con relaciones
            const refreshed = await tx.perfilCandidato.findUnique({
                where: { id: perfil.id },
                include: {
                    usuario: {
                        include: { persona: { include: { ubicacionDepartamento: true, ubicacionCiudad: true } } },
                    },
                    experiencia: true,
                    educacion: true,
                    habilidades: {
                        include: { habilidad: true },
                    },
                },
            });

            return refreshed;
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (err) {
        // Zod
        if (err instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Datos inválidos", errors: err.flatten() },
                { status: 400 }
            );
        }
        // Prisma known errors (opcional)
        // if (err instanceof Prisma.PrismaClientKnownRequestError) { ... }

        // Otros
        return NextResponse.json(
            { message: (err as Error).message ?? "Error del servidor" },
            { status: 500 }
        );
    }
}
