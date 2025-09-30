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
    const ofertaIds: string[] = Array.isArray(ids) ? ids.map(String) : [];
    if (ofertaIds.length === 0) return NextResponse.json({ saved: {} });

    const rows = await prisma.guardadoOferta.findMany({
        where: { userId: session.user.id as string, ofertaLaboralId: { in: ofertaIds } },
        select: { ofertaLaboralId: true },
    });

    const saved = Object.fromEntries(rows.map(r => [String(r.ofertaLaboralId), true]));

    return NextResponse.json({ saved });
}
