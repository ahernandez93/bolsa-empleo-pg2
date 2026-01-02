"use client";

import { useTransition } from "react";
import axios from "axios";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
    ofertaId: string;
    saved: boolean;
    className?: string;
    onChange?(saved: boolean): void;
};

export function BotonGuardarOferta({ ofertaId, saved = false, className, onChange }: Props) {
    const { status } = useSession();
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const onClick = () => {
        // Requiere login
        if (status !== "authenticated") {
            toast.info("Inicia sesión para guardar ofertas");
            router.push("/login");
            return;
        }

        const next = !saved;
        onChange?.(next);

        startTransition(async () => {
            try {
                const { data } = await axios.post("/api/guardados", { ofertaId });
                const serverValue = Boolean(data?.saved);

                if (serverValue !== next) {
                    onChange?.(serverValue);
                }
                toast.success(serverValue ? "Oferta guardada" : "Quitada de guardados");
            } catch (err) {
                onChange?.(!next);

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
