"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export function VerDetalleOfertaButton({ id }: { id: string }) {
    return (
        <Button asChild variant="outline" className="whitespace-nowrap">
            <Link href={`/ofertas/${id}`} prefetch>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalle
            </Link>
        </Button>
    );
}