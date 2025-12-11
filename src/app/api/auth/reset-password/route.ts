// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const resetSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = resetSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { ok: false, message: "Datos inválidos" },
                { status: 400 }
            );
        }

        const { token, password } = parsed.data;

        const tokenRecord = await prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!tokenRecord) {
            return NextResponse.json(
                { ok: false, message: "Token inválido o no encontrado" },
                { status: 400 }
            );
        }

        if (tokenRecord.usedAt) {
            return NextResponse.json(
                { ok: false, message: "Este enlace ya fue utilizado" },
                { status: 400 }
            );
        }

        if (tokenRecord.expiresAt < new Date()) {
            return NextResponse.json(
                { ok: false, message: "El enlace ha expirado" },
                { status: 400 }
            );
        }

        const hashed = await bcrypt.hash(password, 10);

        await prisma.$transaction([
            prisma.usuario.update({
                where: { id: tokenRecord.userId },
                data: { passwordHash: hashed },
            }),
            prisma.passwordResetToken.update({
                where: { id: tokenRecord.id },
                data: { usedAt: new Date() },
            }),
            // borrar otros tokens activos de ese usuario
            prisma.passwordResetToken.deleteMany({
                where: {
                    userId: tokenRecord.userId,
                    id: { not: tokenRecord.id },
                },
            }),
        ]);

        return NextResponse.json({
            ok: true,
            message: "Contraseña actualizada correctamente",
        });
    } catch (error) {
        console.error("Error en reset-password:", error);
        return NextResponse.json(
            { ok: false, message: "Error interno al restablecer la contraseña" },
            { status: 500 }
        );
    }
}
