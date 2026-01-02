export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { put, del } from "@vercel/blob";
import { randomUUID } from "crypto";

async function assertOwnerAndContratacion(postulacionId: string, userId: string) {
    const perfil = await prisma.perfilCandidato.findUnique({
        where: { usuarioId: userId },
        select: { id: true },
    });
    if (!perfil) return { ok: false as const, status: 400, message: "No tiene perfil" };

    const postulacion = await prisma.postulacion.findFirst({
        where: { id: postulacionId, perfilCandidatoId: perfil.id },
        select: { id: true, estado: true },
    });
    if (!postulacion) return { ok: false as const, status: 404, message: "Postulación no encontrada" };

    if (postulacion.estado !== "CONTRATACION") {
        return { ok: false as const, status: 403, message: "Documentación disponible solo en CONTRATACION" };
    }

    return { ok: true as const, perfilId: perfil.id };
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: postulacionId } = await params;

    try {
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) return NextResponse.json({ message: "No autenticado" }, { status: 401 });

        const check = await assertOwnerAndContratacion(postulacionId, userId);
        if (!check.ok) return NextResponse.json({ message: check.message }, { status: check.status });

        const perfil = await prisma.perfilCandidato.findUnique({
            where: { usuarioId: userId },
            select: {
                id: true,
                usuario: {
                    select: {
                        persona: { select: { nombre: true, apellido: true } },
                    },
                },
            },
        });

        if (!perfil) {
            return NextResponse.json({ message: "No tiene perfil" }, { status: 400 });
        }

        const nombreCandidato = `${perfil.usuario.persona.nombre} ${perfil.usuario.persona.apellido}`;

        const postulacion = await prisma.postulacion.findFirst({
            where: { id: postulacionId, perfilCandidatoId: perfil.id },
            select: {
                id: true,
                estado: true,
                oferta: {
                    select: {
                        puesto: true,
                        empresa: { select: { nombre: true } },
                    },
                },
            },
        });

        if (!postulacion) {
            return NextResponse.json({ message: "Postulación no encontrada" }, { status: 404 });
        }

        if (postulacion.estado !== "CONTRATACION") {
            return NextResponse.json(
                { message: "Documentación disponible solo en CONTRATACION" },
                { status: 403 }
            );
        }

        const tipos = await prisma.documentoTipo.findMany({ orderBy: { orden: "asc" } });

        const existentes = await prisma.postulacionDocumento.findMany({
            where: { postulacionId },
            select: {
                documentoTipoId: true,
                estado: true,
                url: true,
            },
        });

        const map = new Map(existentes.map(e => [e.documentoTipoId, e]));

        const docs = tipos.map(t => {
            const ex = map.get(t.id);
            return {
                documentoTipoId: t.id,
                codigo: t.codigo,
                nombre: t.nombre,
                requerido: t.requerido,
                orden: t.orden,
                estado: ex?.estado ?? "PENDIENTE",
                url: ex?.url ?? null,
            };
        });

        return NextResponse.json({
            meta: {
                candidato: { nombreCompleto: nombreCandidato },
                oferta: {
                    puesto: postulacion.oferta.puesto,
                    empresa: postulacion.oferta.empresa?.nombre ?? "",
                },
            },
            docs,
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Error al cargar documentos" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: postulacionId } = await params;
    try {
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) return NextResponse.json({ message: "No autenticado" }, { status: 401 });

        const check = await assertOwnerAndContratacion(postulacionId, userId);
        if (!check.ok) return NextResponse.json({ message: check.message }, { status: check.status });

        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const documentoTipoId = formData.get("documentoTipoId") as string | null;

        if (!file || !documentoTipoId) {
            return NextResponse.json({ message: "Falta file o documentoTipoId" }, { status: 400 });
        }

        const tipo = await prisma.documentoTipo.findUnique({
            where: { id: documentoTipoId },
            select: { aceptaPdf: true, aceptaImg: true, codigo: true },
        });
        if (!tipo) return NextResponse.json({ message: "Tipo inválido" }, { status: 400 });

        const isPdf = file.type === "application/pdf";
        const isImg = file.type.startsWith("image/");

        if ((isPdf && !tipo.aceptaPdf) || (isImg && !tipo.aceptaImg) || (!isPdf && !isImg)) {
            return NextResponse.json({ message: "Formato no permitido" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const size = bytes.byteLength;
        if (size > 8 * 1024 * 1024) {
            return NextResponse.json({ message: "Máximo 8MB" }, { status: 400 });
        }

        const ext = isPdf ? "pdf" : (file.type.split("/")[1] || "jpg");
        const key = `contratacion}/${tipo.codigo}-${randomUUID()}.${ext}`;

        // si ya existía uno, borramos el anterior para no acumular basura
        const prev = await prisma.postulacionDocumento.findUnique({
            where: { postulacionId_documentoTipoId: { postulacionId, documentoTipoId } },
            select: { url: true, key: true },
        });
        if (prev?.url || prev?.key) {
            await del(prev.url ?? prev.key!);
        }

        const blob = await put(key, bytes, {
            access: "public",
            contentType: file.type,
            addRandomSuffix: false,
        });

        await prisma.postulacionDocumento.upsert({
            where: { postulacionId_documentoTipoId: { postulacionId, documentoTipoId } },
            create: {
                postulacionId,
                documentoTipoId,
                estado: "SUBIDO",
                url: blob.url,
                key,
                mimeType: file.type,
                size,
                subidoEn: new Date(),
            },
            update: {
                estado: "SUBIDO",
                url: blob.url,
                key,
                mimeType: file.type,
                size,
                subidoEn: new Date(),
            },
        });

        return NextResponse.json({ ok: true, url: blob.url });
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ message: e?.message ?? "Error al subir documento" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: postulacionId } = await params;

        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) return NextResponse.json({ message: "No autenticado" }, { status: 401 });

        const body = await req.json().catch(() => null);
        const documentoTipoId = body?.documentoTipoId as string | undefined;
        if (!documentoTipoId) {
            return NextResponse.json({ message: "Falta documentoTipoId" }, { status: 400 });
        }

        // perfil del candidato
        const perfil = await prisma.perfilCandidato.findUnique({
            where: { usuarioId: userId },
            select: { id: true },
        });
        if (!perfil) return NextResponse.json({ message: "No tiene perfil" }, { status: 400 });

        // verificar postulación es del candidato y está en CONTRATACION
        const postulacion = await prisma.postulacion.findFirst({
            where: { id: postulacionId, perfilCandidatoId: perfil.id },
            select: { id: true, estado: true },
        });
        if (!postulacion) return NextResponse.json({ message: "Postulación no encontrada" }, { status: 404 });
        if (postulacion.estado !== "CONTRATACION") {
            return NextResponse.json({ message: "Acción no permitida" }, { status: 403 });
        }

        // buscar documento
        const doc = await prisma.postulacionDocumento.findFirst({
            where: { postulacionId, documentoTipoId },
            select: { id: true, url: true, key: true },
        });
        if (!doc) return NextResponse.json({ ok: true });

        // borrar blob
        if (doc.key) await del(doc.key);
        else if (doc.url) await del(doc.url);

        // borrar registro
        await prisma.postulacionDocumento.delete({ where: { id: doc.id } });

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Error al eliminar documento" }, { status: 500 });
    }
}
