"use client";

import { useState, useTransition, useEffect } from "react";
import axios from "axios";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
    ofertaId: string;
    initialSaved?: boolean;
    className?: string;
    onChange?(saved: boolean): void;
};

export function BotonGuardarOferta({ ofertaId, initialSaved = false, className, onChange }: Props) {
    const { status } = useSession();
    const router = useRouter();
    const [saved, setSaved] = useState(!!initialSaved);
    const [pending, startTransition] = useTransition();

    useEffect(() => {
        if (status === "authenticated") {
            setSaved(!!initialSaved);
        } else if (status === "unauthenticated") {
            setSaved(false);
        }
    }, [status, initialSaved]);

    const onClick = () => {
        // Requiere login
        if (status !== "authenticated") {
            toast.info("Inicia sesión para guardar ofertas");
            router.push("/login");
            return;
        }

        // UI optimista
        setSaved((s) => !s);

        startTransition(async () => {
            try {
                const { data } = await axios.post("/api/guardados", { ofertaId });
                const v = Boolean(data?.saved);
                setSaved(v);
                onChange?.(v);
                toast.success(v ? "Oferta guardada" : "Quitada de guardados");
            } catch (err) {
                // revierte optimismo
                setSaved((s) => {
                    const v = !s;           // revertir
                    onChange?.(v);
                    return v;
                });

                if (axios.isAxiosError(err)) {
                    if (err.response?.status === 401) {
                        toast.info("Inicia sesión para guardar ofertas");
                        router.push("/login");
                    } else {
                        toast.error(err.response?.data?.message || "No se pudo actualizar el guardado");
                    }
                } else {
                    toast.error("Error de red");
                }
            }
        });
    };

    return (
        <Button
            type="button"
            variant={saved ? "secondary" : "ghost"}
            size="icon"
            onClick={onClick}
            disabled={pending}
            className={cn("rounded-full", className)}
            aria-label={saved ? "Quitar de guardados" : "Guardar oferta"}
            title={saved ? "Quitar de guardados" : "Guardar oferta"}
        >
            {saved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
        </Button>
    );
}
