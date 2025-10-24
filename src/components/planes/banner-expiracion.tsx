"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BannerExpiracion({
    diasParaVencer,
    vencePronto,
    expirada,
}: {
    diasParaVencer: number | null;
    vencePronto: boolean;
    expirada: boolean;
}) {
    if (expirada) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Suscripción expirada</AlertTitle>
                <AlertDescription className="flex flex-wrap items-center gap-2">
                    Tu suscripción ha vencido. Algunas funciones pueden estar deshabilitadas.
                    <Link href="/admin/planes">
                        <Button size="sm" className="ml-3">Renovar plan</Button>
                    </Link>
                </AlertDescription>
            </Alert>
        );
    }

    if (!vencePronto || diasParaVencer == null) return null;

    return (
        <Alert>
            <AlertTitle>Tu plan vence pronto</AlertTitle>
            <AlertDescription className="flex flex-wrap items-center gap-2">
                Quedan <b className="mx-1">{diasParaVencer}</b> día{diasParaVencer === 1 ? "" : "s"} de suscripción.
                <Link href="/admin/planes">
                    <Button size="sm" variant="secondary" className="ml-3">Ver planes</Button>
                </Link>
            </AlertDescription>
        </Alert>
    );
}
