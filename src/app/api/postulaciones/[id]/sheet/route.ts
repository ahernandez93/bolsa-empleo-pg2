// app/api/postulaciones/[id]/sheet/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEmpresaSession } from "@/lib/auth/guard";

type Params = { id: string };

export async function GET(_: Request, { params }: { params: Promise<Params> }) {
    const { empresaId, rol, session } = await requireEmpresaSession();
    const { id } = await params
    const postulacionId = id;
    const userId = session?.user?.id;

    const postulacion = await prisma.postulacion.findUnique({
        where: { id: postulacionId },
        include: {
            oferta: {
                include: {
                    ubicacionCiudad: true,
                    ubicacionDepartamento: true,
                    empresa: true,
                },
            },
            perfil: {
                include: {
                    usuario: { include: { persona: { include: { ubicacionCiudad: true, ubicacionDepartamento: true } } } },
                    experiencia: true,
                    educacion: true,
                },
            },
            postulacionDocumentos: {
                include: { documentoTipo: true },
                orderBy: { documentoTipo: { orden: "asc" } },
            },
        },
    });

    if (!postulacion) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const isSuperAdmin = rol === "SUPERADMIN";
    const isRecruiter = rol === "RECLUTADOR";
    if (!isSuperAdmin && empresaId) {
        const perteneceEmpresa = postulacion.oferta.empresaId === empresaId;
        if (!perteneceEmpresa) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

        if (isRecruiter) {
            const reclutadorOk =
                postulacion.oferta.agregadoPorId === userId ||
                postulacion.oferta.reclutadorId === userId;
            if (!reclutadorOk) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }
    }

    const tipos = await prisma.documentoTipo.findMany({
        orderBy: { orden: "asc" },
    })

    // 2) Mapear docs subidos por tipo
    const docsMap = new Map(
        postulacion.postulacionDocumentos.map((d) => [d.documentoTipoId, d])
    )

    // 3) Merge final: siempre devuelve todos los “slots”
    const documentos = tipos.map((t) => {
        const doc = docsMap.get(t.id)

        const subido = Boolean(doc?.url)

        return {
            tipoId: t.id,
            codigo: t.codigo,
            nombre: t.nombre,
            requerido: t.requerido,
            ayuda: t.ayuda,

            subido,
            estado: subido ? "SUBIDO" : "PENDIENTE",
            url: doc?.url ?? null,
            mimeType: doc?.mimeType ?? null,
            size: doc?.size ?? null,
            subidoEn: doc?.subidoEn ? doc.subidoEn.toISOString() : null,
        }
    })

    const persona = postulacion.perfil.usuario.persona;

    return NextResponse.json({
        postulacion: {
            id: postulacion.id,
            estado: postulacion.estado,
            fechaPostulacion: postulacion.fechaPostulacion.toISOString(),
            notasInternas: postulacion.notasInternas,
        },
        candidato: {
            nombreCompleto: `${persona.nombre} ${persona.apellido}`,
            email: postulacion.perfil.usuario.email,
            telefono: persona.telefono ?? null,
            ubicacion: `${persona.ubicacionCiudad?.nombre ?? ""} - ${persona.ubicacionDepartamento?.nombre ?? ""}`.trim(),
            genero: persona.genero ?? null,
            direccion: persona.direccion ?? null,
        },
        experiencia: postulacion.perfil.experiencia,
        educacion: postulacion.perfil.educacion,
        cvUrl: postulacion.cvSnapshotUrl ?? postulacion.perfil.cvUrl ?? null,
        documentos,
    });
}
