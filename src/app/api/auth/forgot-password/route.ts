// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { z } from "zod";
import { sendPasswordResetEmail } from "@/lib/mailer";

const forgotSchema = z.object({
    email: z.string().email(),
    tipo: z.enum(["admin", "candidato"]).optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = forgotSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { ok: false, message: "Datos inválidos" },
                { status: 400 }
            );
        }

        const { email, tipo } = parsed.data;

        const user = await prisma.usuario.findUnique({
            where: { email },
            include: { persona: true },
        });

        const genericResponse = NextResponse.json({
            ok: true,
            message:
                "Si el correo está registrado, te hemos enviado un enlace para restablecer la contraseña.",
        });

        if (!user) {
            return genericResponse;
        }

        //limpiar tokens viejos de ese usuario
        await prisma.passwordResetToken.deleteMany({
            where: {
                userId: user.id,
                usedAt: null,
            },
        });

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        await prisma.passwordResetToken.create({
            data: {
                token,
                userId: user.id,
                expiresAt,
            },
        });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        const resetPath =
            tipo === "candidato"
                ? "/restablecer-contrasena"
                : "/admin/restablecer-contrasena";

        const resetUrl = `${baseUrl}${resetPath}?token=${token}`;

        const nombreCompleto = user.persona
            ? `${user.persona.nombre} ${user.persona.apellido}`
            : null;

        await sendPasswordResetEmail(user.email, resetUrl, nombreCompleto);

        return genericResponse;
    } catch (error) {
        console.error("Error en forgot-password:", error);
        return NextResponse.json(
            {
                ok: false,
                message: "Error interno al procesar la solicitud",
            },
            { status: 500 }
        );
    }
}
