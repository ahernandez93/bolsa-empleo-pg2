import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { toggleSaveSchema } from "@/lib/schemas/guardados";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = toggleSaveSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ message: parsed.error.flatten() }, { status: 400 });
    }

    const { ofertaId } = parsed.data;
    const userId = session.user.id as string;

    // ¿Existe ya?
    const existing = await prisma.guardadoOferta.findUnique({
        where: { user_offer_unique: { userId, ofertaLaboralId: ofertaId } },
    });

    if (existing) {
        // Desguardar
        await prisma.guardadoOferta.delete({ where: { id: existing.id } });
        return NextResponse.json({ saved: false });
    } else {
        // Guardar
        await prisma.guardadoOferta.create({
            data: { userId, ofertaLaboralId: ofertaId },
        });
        return NextResponse.json({ saved: true });
    }
}
