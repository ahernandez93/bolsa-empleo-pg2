// /api/superadmin/empresas/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEmpresaSession } from "@/lib/auth/guard";

export async function GET() {
    const { rol } = await requireEmpresaSession();
    if (rol !== "SUPERADMIN") {
        return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const empresas = await prisma.empresa.findMany({
        select: { id: true, nombre: true },
        orderBy: { nombre: "asc" },
    });

    return NextResponse.json(empresas);
}
