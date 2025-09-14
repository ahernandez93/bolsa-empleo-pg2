import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    const { ids } = await req.json();
    const ofertaIds: string[] = Array.isArray(ids) ? ids : [];
    if (ofertaIds.length === 0) return NextResponse.json({ saved: {} });

    const rows = await prisma.guardadoOferta.findMany({
        where: { userId: session.user.id as string, ofertaLaboralId: { in: ofertaIds } },
        select: { ofertaLaboralId: true },
    });

    const saved: Record<string, boolean> = {};
    for (const r of rows) saved[r.ofertaLaboralId] = true;

    return NextResponse.json({ saved });
}
