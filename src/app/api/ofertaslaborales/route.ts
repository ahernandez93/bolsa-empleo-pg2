import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import z from "zod";
import { ofertaLaboralServerSchema } from "@/lib/schemas/ofertaLaboralSchema";
import { auth } from "@/lib/auth/auth";

export async function GET() {
    try {
        const ofertasLaborales = await prisma.ofertaLaboral.findMany({
        });

        const data = ofertasLaborales.map(ofertaLaboral => ({
            id: ofertaLaboral.id,
            puesto: ofertaLaboral.puesto,
            descripcionPuesto: ofertaLaboral.descripcionPuesto,
            area: ofertaLaboral.area,
            ubicacionPais: ofertaLaboral.ubicacionPais,
            ubicacionDepartamento: ofertaLaboral.ubicacionDepartamento,
            ubicacionCiudad: ofertaLaboral.ubicacionCiudad,
            empresa: ofertaLaboral.empresa,
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

        const parsed = ofertaLaboralServerSchema.safeParse({ ...body, agregadoPorId });
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Datos inválidos", errors: parsed.error.flatten() },
                { status: 400 }
            );
        }
        const data = parsed.data;

        console.log(data)

        const nuevaOferta = await prisma.ofertaLaboral.create({
            data: {
                puesto: data.puesto,
                descripcionPuesto: data.descripcionPuesto,
                area: data.area,
                ubicacionPais: data.ubicacionPais,
                ubicacionDepartamento: data.ubicacionDepartamento as string,
                ubicacionCiudad: data.ubicacionCiudad as string,
                empresa: data.empresa,
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
                message: "Oferta Laboral creado correctamente", ofertaLaboral: nuevaOferta
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
