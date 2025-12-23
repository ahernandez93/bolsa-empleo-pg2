// app/postulaciones/[id]/reporte/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEmpresaSession } from "@/lib/auth/guard";
import {
    PDFDocument,
    rgb,
    StandardFonts,
} from "pdf-lib";

export const runtime = "nodejs";

const A4 = { w: 595.28, h: 841.89 }; // puntos PDF
const MARGIN = 40;
const HEADER_H = 64; // espacio para título + línea
const GAP = 10;

async function fetchAsArrayBuffer(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`No se pudo descargar: ${url}`);
    return await res.arrayBuffer();
}

function isPdf(mime: string | null, url: string) {
    const u = url.toLowerCase();
    const m = (mime ?? "").toLowerCase();
    return m.includes("pdf") || u.endsWith(".pdf");
}

function isPng(mime: string | null, url: string) {
    const u = url.toLowerCase();
    const m = (mime ?? "").toLowerCase();
    return m.includes("png") || u.endsWith(".png");
}

function isJpg(mime: string | null, url: string) {
    const u = url.toLowerCase();
    const m = (mime ?? "").toLowerCase();
    return (
        m.includes("jpeg") ||
        m.includes("jpg") ||
        u.endsWith(".jpg") ||
        u.endsWith(".jpeg")
    );
}

function fitRect(
    srcW: number,
    srcH: number,
    maxW: number,
    maxH: number
) {
    const scale = Math.min(maxW / srcW, maxH / srcH);
    const w = srcW * scale;
    const h = srcH * scale;
    return { w, h, scale };
}

async function createA4PageWithHeader(opts: {
    pdf: PDFDocument;
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    font: any;
    title: string;
    subtitle?: string;
}) {
    const { pdf, font, title, subtitle } = opts;

    const page = pdf.addPage([A4.w, A4.h]);

    // Header background suave (opcional)
    // page.drawRectangle({ x: 0, y: A4.h - HEADER_H, width: A4.w, height: HEADER_H, color: rgb(0.06, 0.07, 0.10) });

    const titleSize = 14;
    const subtitleSize = 10;

    const titleWidth = font.widthOfTextAtSize(title, titleSize);
    const titleX = (A4.w - titleWidth) / 2;

    page.drawText(title, {
        x: Math.max(MARGIN, titleX),
        y: A4.h - MARGIN - 18,
        size: titleSize,
        font,
        color: rgb(0.1, 0.1, 0.1),
    });

    if (subtitle) {
        const subWidth = font.widthOfTextAtSize(subtitle, subtitleSize);
        const subX = (A4.w - subWidth) / 2;
        page.drawText(subtitle, {
            x: Math.max(MARGIN, subX),
            y: A4.h - MARGIN - 36,
            size: subtitleSize,
            font,
            color: rgb(0.35, 0.35, 0.35),
        });
    }

    // Línea separadora
    page.drawLine({
        start: { x: MARGIN, y: A4.h - HEADER_H + 2 },
        end: { x: A4.w - MARGIN, y: A4.h - HEADER_H + 2 },
        thickness: 1,
        color: rgb(0.85, 0.85, 0.85),
    });

    // Área útil debajo del header
    const contentBox = {
        x: MARGIN,
        y: MARGIN,
        w: A4.w - MARGIN * 2,
        h: A4.h - MARGIN * 2 - (HEADER_H - GAP),
    };

    return { page, contentBox };
}

async function addPdfAsA4Pages(opts: {
    outPdf: PDFDocument;
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    font: any;
    title: string;
    bytes: ArrayBuffer;
}) {
    const { outPdf, font, title, bytes } = opts;

    const srcPdf = await PDFDocument.load(bytes);
    const indices = srcPdf.getPageIndices();

    // Copiamos cada página como objeto embebido y la dibujamos en A4
    for (let i = 0; i < indices.length; i++) {
        const [embeddedPage] = await outPdf.embedPdf(bytes, [indices[i]]);

        const { page, contentBox } = await createA4PageWithHeader({
            pdf: outPdf,
            font,
            title,
            subtitle: indices.length > 1 ? `Página ${i + 1} de ${indices.length}` : undefined,
        });

        // Tamaño original del embedded
        const srcW = embeddedPage.width;
        const srcH = embeddedPage.height;

        const fitted = fitRect(srcW, srcH, contentBox.w, contentBox.h);

        const x = contentBox.x + (contentBox.w - fitted.w) / 2;
        const y = contentBox.y + (contentBox.h - fitted.h) / 2;

        page.drawPage(embeddedPage, {
            x,
            y,
            width: fitted.w,
            height: fitted.h,
        });
    }
}

async function addImageAsA4Page(opts: {
    outPdf: PDFDocument;
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    font: any;
    title: string;
    bytes: ArrayBuffer;
    kind: "png" | "jpg";
}) {
    const { outPdf, font, title, bytes, kind } = opts;

    const { page, contentBox } = await createA4PageWithHeader({
        pdf: outPdf,
        font,
        title,
    });

    const img =
        kind === "png"
            ? await outPdf.embedPng(bytes)
            : await outPdf.embedJpg(bytes);

    const srcW = img.width;
    const srcH = img.height;

    const fitted = fitRect(srcW, srcH, contentBox.w, contentBox.h);

    const x = contentBox.x + (contentBox.w - fitted.w) / 2;
    const y = contentBox.y + (contentBox.h - fitted.h) / 2;

    page.drawImage(img, {
        x,
        y,
        width: fitted.w,
        height: fitted.h,
    });
}

async function addErrorPage(opts: {
    outPdf: PDFDocument
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    font: any
    title: string
    message: string
    details?: string
}) {
    const { outPdf, font, title, message, details } = opts

    const page = outPdf.addPage([A4.w, A4.h])

    const titleSize = 14
    const bodySize = 11

    const titleWidth = font.widthOfTextAtSize(title, titleSize)

    // Título centrado
    page.drawText(title, {
        x: (A4.w - titleWidth) / 2,
        y: A4.h - 80,
        size: titleSize,
        font,
        color: rgb(0.1, 0.1, 0.1),
    })

    // Línea separadora
    page.drawLine({
        start: { x: MARGIN, y: A4.h - 100 },
        end: { x: A4.w - MARGIN, y: A4.h - 100 },
        thickness: 1,
        color: rgb(0.85, 0.85, 0.85),
    })

    const baseText =
        `${message}\n\n` +
        `Fecha de generación del reporte: ${new Date().toLocaleDateString("es-HN")}`

    page.drawText(baseText, {
        x: MARGIN,
        y: A4.h - 140,
        size: bodySize,
        font,
        color: rgb(0.35, 0.35, 0.35),
        lineHeight: 16,
        maxWidth: A4.w - MARGIN * 2,
    })

    // Detalles técnicos (opcional) abajo en pequeño
    if (details) {
        page.drawText(`Detalles: ${details}`, {
            x: MARGIN,
            y: MARGIN + 20,
            size: 9,
            font,
            color: rgb(0.55, 0.55, 0.55),
            maxWidth: A4.w - MARGIN * 2,
        })
    }
}


type Params = { id: string };

export async function GET(_: Request, { params }: { params: Promise<Params> }) {
    const { empresaId, rol, session } = await requireEmpresaSession();
    const { id } = await params;
    const postulacionId = id;
    const userId = session?.user?.id;

    const postulacion = await prisma.postulacion.findUnique({
        where: { id: postulacionId },
        include: {
            oferta: true,
            perfil: true,
            postulacionDocumentos: {
                include: { documentoTipo: true },
                orderBy: { documentoTipo: { orden: "asc" } },
            },
        },
    });

    if (!postulacion) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    // Seguridad (igual a tu lógica)
    const isSuperAdmin = rol === "SUPERADMIN";
    const isRecruiter = rol === "RECLUTADOR";

    if (!isSuperAdmin && empresaId) {
        if (postulacion.oferta.empresaId !== empresaId) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }
        if (isRecruiter) {
            const ok =
                postulacion.oferta.agregadoPorId === userId ||
                postulacion.oferta.reclutadorId === userId;
            if (!ok) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }
    }

    // (Opcional) solo contratados
    // if (postulacion.estado !== "CONTRATACION") {
    //   return NextResponse.json({ message: "Reporte solo en CONTRATACION" }, { status: 403 });
    // }

    const outPdf = await PDFDocument.create();
    const font = await outPdf.embedFont(StandardFonts.Helvetica);

    // 1) CV primero
    const cvUrl = postulacion.cvSnapshotUrl ?? postulacion.perfil.cvUrl ?? null;
    if (cvUrl) {
        try {
            const bytes = await fetchAsArrayBuffer(cvUrl);
            await addPdfAsA4Pages({
                outPdf,
                font,
                title: "Hoja de Vida",
                bytes,
            });
        } catch (e) {
            await addErrorPage({
                outPdf,
                font,
                title: "Hoja de Vida",
                message:
                    "No fue posible adjuntar la Hoja de Vida al momento de generar el reporte.\n" +
                    "Esto puede deberse a que el archivo no esté disponible, haya sido eliminado o exista un problema de acceso.",
                details: e instanceof Error ? e.message : String(e),
            })
        }
    }

    // 2) Documentación después (por orden del DocumentoTipo)
    for (const d of postulacion.postulacionDocumentos) {
        if (!d.url) continue;

        const title = d.documentoTipo.nombre; // ej: "DNI (Frontal)" / "Título de Estudios (Frontal)"
        try {
            const bytes = await fetchAsArrayBuffer(d.url);

            if (isPdf(d.mimeType, d.url)) {
                await addPdfAsA4Pages({ outPdf, font, title, bytes });
                continue;
            }

            if (isPng(d.mimeType, d.url)) {
                await addImageAsA4Page({ outPdf, font, title, bytes, kind: "png" });
                continue;
            }

            if (isJpg(d.mimeType, d.url)) {
                await addImageAsA4Page({ outPdf, font, title, bytes, kind: "jpg" });
                continue;
            }

            await addErrorPage({
                outPdf,
                font,
                title,
                message:
                    "El archivo fue encontrado, pero su tipo no es compatible para incorporarlo al reporte.\n" +
                    "Formatos soportados: PDF, PNG, JPG/JPEG.",
                details: `mimeType=${d.mimeType ?? "null"} | url=${d.url}`,
            })

        } catch (e) {
            await addErrorPage({
                outPdf,
                font,
                title,
                message:
                    "No fue posible cargar este documento al momento de generar el reporte.\n" +
                    "Esto puede deberse a que el archivo no esté disponible o exista un problema de acceso.",
                details: e instanceof Error ? e.message : String(e),
            })
        }
    }

    const outRaw = await outPdf.save();
    const out = new Uint8Array(outRaw); // normaliza typings

    const stream = new ReadableStream<Uint8Array>({
        start(controller) {
            controller.enqueue(out);
            controller.close();
        },
    });

    const filename = `reporte-documentacion-${postulacionId}.pdf`;

    return new NextResponse(stream, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${filename}"`,
            "Cache-Control": "no-store",
        },
    });
}
