// app/api/perfil-candidato/me/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { Prisma, Genero } from "@prisma/client";
import { z } from "zod";

const urlOrPath = z.string().refine(
    (v) => /^https?:\/\//.test(v) || v.startsWith("/"),
    "Debe ser URL http(s) o ruta que empiece con /"
);

export async function GET() {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) {
            return NextResponse.json({ message: "No autenticado" }, { status: 401 });
        }

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
        console.error("GET /api/candidatos/perfil", err);
        return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
    }
}

const toDateOrNull = (s?: string | null) => (s ? new Date(`${s}T00:00:00Z`) : null);

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
    nivelAcademico: z.string().optional(),
});

export const perfilUpdateSchema = z.object({
    // Persona + Usuario
    nombre: z.string().min(1).optional(),
    apellido: z.string().min(1).optional(),
    email: z.string().email().optional(),
    telefono: z.string().optional(),
    direccion: z.string().optional(),
    fechaNacimiento: z.string().optional(),
    genero: z.nativeEnum(Genero).nullable().optional(),

    // Ubicación
    ubicacionDepartamentoId: z.coerce.number().int().positive().optional(),
    ubicacionCiudadId: z.coerce.number().int().positive().optional(),

    // PerfilCandidato
    tituloProfesional: z.string().optional(),
    resumen: z.string().max(600).optional(),
    disponibilidad: z.string().optional(),
    disponibilidadViajar: z.boolean().optional(),
    cambioResidencia: z.boolean().optional(),
    poseeVehiculo: z.boolean().optional(),

    // CV
    cvUrl: urlOrPath.optional(),
    cvMimeType: z.string().optional(),
    cvSize: z.coerce.number().int().nonnegative().optional(),

    // Colecciones (solo si vienen)
    experiencia: z.array(experienciaItem).optional(),
    educacion: z.array(educacionItem).optional(),
    habilidades: z.array(z.string().min(1)).optional(),
})
    .partial()
    .passthrough();

export async function PUT(req: Request) {
    try {
        // 1) Auth
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) {
            return NextResponse.json({ message: "No autenticado" }, { status: 401 });
        }

        // 2) Parse body (parcial)
        const raw = await req.json();
        const data = perfilUpdateSchema.parse(raw);

        // 3) Cargar perfil + autorización
        const perfil = await prisma.perfilCandidato.findUnique({
            where: { usuarioId: userId },
            include: { usuario: true },
        });
        if (!perfil) {
            return NextResponse.json({ message: "Perfil no encontrado" }, { status: 404 });
        }
        const isOwner = perfil.usuarioId === userId;
        const isAdmin = perfil.usuario.rol === "ADMIN";
        if (!isOwner && !isAdmin) {
            return NextResponse.json({ message: "No autorizado" }, { status: 403 });
        }

        // 4) Transacción: actualiza SOLO lo que viene en el body
        const updated = await prisma.$transaction(async (tx) => {
            // 4.1) Usuario + Persona (solo campos presentes)
            const usuario = await tx.usuario.findUnique({
                where: { id: perfil.usuarioId },
                include: { persona: true },
            });
            if (!usuario) throw new Error("Usuario del perfil no encontrado");

            const personaData: Prisma.PersonaUpdateInput = {};
            if (data.nombre !== undefined) personaData.nombre = data.nombre;
            if (data.apellido !== undefined) personaData.apellido = data.apellido;
            if (data.telefono !== undefined) personaData.telefono = data.telefono ?? null;
            if (data.direccion !== undefined) personaData.direccion = data.direccion ?? null;
            if (data.fechaNacimiento !== undefined) personaData.fechaNacimiento = toDateOrNull(data.fechaNacimiento);
            if (data.genero !== undefined) personaData.genero = data.genero ?? null;
            if (data.ubicacionDepartamentoId !== undefined) {
                personaData.ubicacionDepartamento = data.ubicacionDepartamentoId
                    ? { connect: { id: data.ubicacionDepartamentoId } }
                    : { disconnect: true };
            }
            if (data.ubicacionCiudadId !== undefined) {
                personaData.ubicacionCiudad = data.ubicacionCiudadId
                    ? { connect: { id: data.ubicacionCiudadId } }
                    : { disconnect: true };
            }

            if (Object.keys(personaData).length > 0) {
                await tx.persona.update({ where: { id: usuario.personaId }, data: personaData });
            }

            if (data.email !== undefined && data.email !== usuario.email) {
                const collision = await tx.usuario.findUnique({ where: { email: data.email } });
                if (collision && collision.id !== usuario.id) {
                    throw new Error("El correo ya está en uso por otro usuario");
                }
                await tx.usuario.update({ where: { id: usuario.id }, data: { email: data.email } });
            }

            // 4.2) PerfilCandidato base + CV (solo campos presentes)
            const perfilData: Prisma.PerfilCandidatoUpdateInput = {};
            if (data.tituloProfesional !== undefined) perfilData.tituloProfesional = data.tituloProfesional ?? null;
            if (data.resumen !== undefined) perfilData.resumen = data.resumen ?? null;
            if (data.disponibilidad !== undefined) perfilData.disponibilidad = data.disponibilidad ?? null;
            if (data.disponibilidadViajar !== undefined) perfilData.disponibilidadViajar = !!data.disponibilidadViajar;
            if (data.cambioResidencia !== undefined) perfilData.cambioResidencia = !!data.cambioResidencia;
            if (data.poseeVehiculo !== undefined) perfilData.poseeVehiculo = !!data.poseeVehiculo;

            // CV (persistir al subir)
            if (data.cvUrl !== undefined) perfilData.cvUrl = data.cvUrl ?? null;
            if (data.cvMimeType !== undefined) perfilData.cvMimeType = data.cvMimeType ?? null;
            if (data.cvSize !== undefined) perfilData.cvSize = data.cvSize ?? null;

            if (Object.keys(perfilData).length > 0) {
                await tx.perfilCandidato.update({ where: { id: perfil.id }, data: perfilData });
            }

            // 4.3) Experiencia (solo si viene la propiedad en el body)
            if (data.experiencia !== undefined) {
                await tx.experienciaLaboral.deleteMany({ where: { perfilCandidatoId: perfil.id } });
                if (data.experiencia?.length) {
                    await tx.experienciaLaboral.createMany({
                        data: data.experiencia.map((e) => ({
                            perfilCandidatoId: perfil.id,
                            empresa: e.empresa,
                            puesto: e.puesto,
                            descripcion: e.descripcion ?? null,
                            fechaInicio: toDateOrNull(e.fechaInicio)!, // requerido si viene
                            fechaFin: toDateOrNull(e.fechaFin),
                        })),
                    });
                }
            }

            // 4.4) Educación (solo si viene la propiedad en el body)
            if (data.educacion !== undefined) {
                await tx.educacion.deleteMany({ where: { perfilCandidatoId: perfil.id } });
                if (data.educacion?.length) {
                    await tx.educacion.createMany({
                        data: data.educacion.map((ed) => ({
                            perfilCandidatoId: perfil.id,
                            institucion: ed.institucion,
                            titulo: ed.titulo,
                            nivelAcademico: ed.nivelAcademico ?? "",
                            fechaInicio: toDateOrNull(ed.fechaInicio),
                            fechaFin: toDateOrNull(ed.fechaFin),
                        })),
                    });
                }
            }

            // 4.5) Habilidades (solo si viene la propiedad en el body)
            if (data.habilidades !== undefined) {
                const skillNames = Array.from(new Set((data.habilidades ?? []).map((s) => s.trim()).filter(Boolean)));
                if (skillNames.length) {
                    const existentes = await tx.habilidad.findMany({
                        where: { nombre: { in: skillNames } },
                        select: { id: true, nombre: true },
                    });
                    const existentesSet = new Set(existentes.map((e) => e.nombre));
                    const porCrear = skillNames.filter((n) => !existentesSet.has(n));
                    if (porCrear.length) {
                        await tx.habilidad.createMany({ data: porCrear.map((nombre) => ({ nombre })) });
                    }
                    const todas = await tx.habilidad.findMany({
                        where: { nombre: { in: skillNames } },
                        select: { id: true },
                    });
                    await tx.perfilCandidatoHabilidad.deleteMany({ where: { perfilCandidatoId: perfil.id } });
                    if (todas.length) {
                        await tx.perfilCandidatoHabilidad.createMany({
                            data: todas.map((h) => ({ perfilCandidatoId: perfil.id, habilidadId: h.id })),
                        });
                    }
                } else {
                    // si mandaste habilidades: [] → limpia todas
                    await tx.perfilCandidatoHabilidad.deleteMany({ where: { perfilCandidatoId: perfil.id } });
                }
            }

            // 4.6) Devolver perfil actualizado con relaciones (ANIDADO)
            return tx.perfilCandidato.findUnique({
                where: { id: perfil.id },
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
                    experiencia: true,
                    educacion: true,
                    habilidades: { include: { habilidad: true } },
                },
            });
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (err) {
        console.error("PUT /api/candidatos/perfil ERROR →", err);
        if (err instanceof z.ZodError) {
            return NextResponse.json({ message: "Datos inválidos", errors: err.issues }, { status: 400 });
        }
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            return NextResponse.json({ message: "Prisma error", code: err.code, meta: err.meta }, { status: 400 });
        }
        return NextResponse.json({ message: (err as Error).message ?? "Error del servidor" }, { status: 500 });
    }
}