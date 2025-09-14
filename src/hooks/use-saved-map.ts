"use client";

import { useMemo } from "react";
import useSWR from "swr";
import axios from "axios";
import { useSession } from "next-auth/react";

function keyFor(ids: string[], authed: boolean) {
    if (!authed || ids.length === 0) return null;
    // clave estable por lista de IDs (ordenada)
    return ["saved-map", ids.slice().sort().join(",")];
}

export function useSavedMap(ids: string[]) {
    const { status } = useSession(); // "authenticated" | "unauthenticated" | "loading"
    const authed = status === "authenticated";

    const swrKey = useMemo(() => keyFor(ids, authed), [ids, authed]);

    const { data, isLoading, error, mutate } = useSWR<Record<string, boolean>>(
        swrKey,
        async ([, csv]) => {
            const list = (csv as string).length ? (csv as string).split(",") : [];
            const { data } = await axios.post("/api/guardados/check", { ids: list });
            return data?.saved ?? {};
        },
        {
            keepPreviousData: true,
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
        }
    );

    return {
        savedMap: data ?? {},
        isLoading,
        error,
        mutate,       // para actualizar inmediatamente desde el botón
        swrKey,       // por si querés mutar desde afuera
    };
}
