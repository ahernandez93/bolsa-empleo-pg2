"use client";

import { Badge } from "@/components/ui/badge";

export default function BadgePlan({ nombre }: { nombre?: string | null }) {
    if (!nombre) return null;
    const variant =
        nombre === "Premium" ? "default" :
            nombre === "Básico" ? "secondary" :
                "outline";
    return <Badge variant={variant}>{nombre}</Badge>;
}
