import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import z from "zod";
import { ofertaLaboralServerSchema } from "@/lib/schemas/ofertaLaboralSchema";
import { auth } from "@/lib/auth/auth";
import { getSuscripcionActiva, contarOfertasActivas } from "@/utils/subscripcion";
import { requireEmpresaSession } from "@/lib/auth/guard";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { empresaId } = await requireEmpresaSession();

        if (!empresaId) {
            return NextResponse.json(
                { message: "Empresa no asociada" },
                { status: 400 }
            );
        }

        const ofertasLaborales = await prisma.ofertaLaboral.findMany({
            where: {
                empresaId,
            }
        });

        const data = ofertasLaborales.map(ofertaLaboral => ({
            id: ofertaLaboral.id,
            puesto: ofertaLaboral.puesto,
            descripcionPuesto: ofertaLaboral.descripcionPuesto,
            area: ofertaLaboral.area,
            ubicacionDepartamentoId: ofertaLaboral.ubicacionDepartamentoId,
            ubicacionCiudadId: ofertaLaboral.ubicacionCiudadId,
            empresaId: ofertaLaboral.empresaId,
            nivelAcademico: ofertaLaboral.nivelAcademico,
            experienciaLaboral: ofertaLaboral.experienciaLaboral,
            tipoTrabajo: ofertaLaboral.tipoTrabajo,
            modalidad: ofertaLaboral.modalidad,
            salario: ofertaLaboral.salario,
            estado: ofertaLaboral.estado,
            agregadoPorId: ofertaLaboral.agregadoPorId,
        }))

        return NextResponse.json({ ofertasLaborales: data });
    } catch (error) {
        console.error("Error al obtener ofertas laborales:", error);
        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        const agregadoPorId = session?.user?.id;
        const body = await req.json();
        console.log("POST /api/ofertaslaborales BODY:", body);

        const { empresaId } = await requireEmpresaSession();

        if (!empresaId) {
            return NextResponse.json(
                { message: "Empresa no asociada" },
                { status: 400 }
            );
        }

        // 2) Validar suscripción
        const sus = await getSuscripcionActiva(empresaId);
        if (!sus) {
            return NextResponse.json(
                { error: "Tu empresa no tiene una suscripción activa." },
                { status: 403 }
            );
        }

        // 3) Validar límite de ofertas activas
        const activas = await contarOfertasActivas(empresaId);
        if (activas >= sus.plan.maxOfertasActivas) {
            return NextResponse.json(
                { error: "Alcanzaste el límite de ofertas activas de tu plan." },
                { status: 403 }
            );
        }

        const parsed = ofertaLaboralServerSchema.safeParse({ ...body, agregadoPorId });
        if (!parsed.success) {
            console.error("ZOD ERRORS:", parsed.error.flatten());
            return NextResponse.json(
                { message: "Datos inválidos", errors: parsed.error.flatten() },
                { status: 400 }
            );
        }
        const data = parsed.data;

        console.log(data)

        const nuevaOferta = await prisma.ofertaLaboral.create({
            data: {
                empresaId,
                puesto: data.puesto,
                descripcionPuesto: data.descripcionPuesto,
                area: data.area,
                ubicacionDepartamentoId: data.ubicacionDepartamentoId,
                ubicacionCiudadId: data.ubicacionCiudadId,
                nivelAcademico: data.nivelAcademico,
                experienciaLaboral: data.experienciaLaboral, // INT en Prisma
                tipoTrabajo: data.tipoTrabajo,
                modalidad: data.modalidad,
                salario: data.salario,
                agregadoPorId: data.agregadoPorId,
                estado: data.estado,
            }
        });

        return NextResponse.json(
            {
                message: "Oferta Laboral creada correctamente", ofertaLaboral: nuevaOferta
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error al crear oferta laboral:", error);

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
