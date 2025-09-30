"use client";

import { useMemo } from "react";
import useSWR from "swr";
import axios from "axios";
import { useSession } from "next-auth/react";

function keyFor(ids: string[], authed: boolean, userId: string | null) {
    if (!authed || ids.length === 0) return null;
    // clave estable por lista de IDs (ordenada)
    return ["saved-map", userId, ids.slice().sort().join(",")];
}

export function useSavedMap(ids: Array<string | number>, userIdFromParent?: string) {
    const { status, data } = useSession(); // "authenticated" | "unauthenticated" | "loading"
    const authed = status === "authenticated";
    const userId = userIdFromParent ?? (authed ? (data?.user?.id as string) : null);

    const strIds = useMemo(() => ids.map((x) => String(x)), [ids]);
    const swrKey = useMemo(() => keyFor(strIds, authed, userId), [strIds, authed, userId]);

    const { data: map, isLoading, error, mutate } = useSWR<Record<string, boolean>>(
        swrKey,
        async ([, , csv]) => {
            const list = (csv as string).length ? (csv as string).split(",") : [];
            const { data } = await axios.post("/api/guardados/check", { ids: list });
            return data?.saved ?? {};
        },
        {
            keepPreviousData: false,      // no arrastres estado de otras listas/usuarios
            revalidateOnMount: true,
            revalidateIfStale: true,
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            fallbackData: {},             // por defecto: nada guardado
        }
    );

    return {
        savedMap: map ?? {},
        isLoading,
        error,
        mutate,       // para actualizar inmediatamente desde el botón
        swrKey,       // por si querés mutar desde afuera
    };
}
