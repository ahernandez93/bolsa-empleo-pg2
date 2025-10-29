export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { del } from "@vercel/blob";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        if (!file) {
            return NextResponse.json({ message: "No file" }, { status: 400 });
        }

        if (file.type !== "application/pdf") {
            return NextResponse.json({ message: "Solo se admite PDF" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const size = buffer.byteLength;
        if (size > 8 * 1024 * 1024) {
            return NextResponse.json({ message: "El archivo excede 8MB" }, { status: 400 });
        }

        const key = `${randomUUID()}.pdf`;

        const blob = await put(key, bytes, {
            access: "public",
            contentType: "application/pdf",
            addRandomSuffix: false,
        });

        return NextResponse.json({
            url: blob.url, //`/uploads/${key}`,
            mime: file.type,
            size,
            key,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        console.error("POST /api/candidatos/cv error:", e);
        return NextResponse.json(
            { message: e?.message ?? "Error al subir CV" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        // 1) Auth
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) {
            return NextResponse.json({ message: "No autenticado" }, { status: 401 });
        }

        // 2) key del query
        const { searchParams } = new URL(req.url);
        const url = searchParams.get("url");
        const key = searchParams.get("key");
        if (!url && !key) {
            return NextResponse.json({ message: "Falta url o key" }, { status: 400 });
        }

        // 3) Borrar archivo local (ignora si no existe)
        await del(url ?? key!);

        // 4) Limpiar campos del CV en la BD
        await prisma.perfilCandidato.update({
            where: { usuarioId: userId },
            data: {
                cvUrl: null,
                cvMimeType: null,
                cvSize: null,
                cvKey: null,
            },
        });

        return NextResponse.json({ ok: true });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        console.error("DELETE /api/candidatos/cv error:", e);
        return NextResponse.json(
            { message: e?.message ?? "Error al eliminar CV" },
            { status: 500 }
        );
    }
}
