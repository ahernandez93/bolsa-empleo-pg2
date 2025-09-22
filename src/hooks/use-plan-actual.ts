"use client";

import useSWR from "swr";
import axios from "axios";

const fetcher = (url: string) => axios.get(url).then(r => r.data);

export type PlanActual = {
    ok: boolean;
    plan: {
        nombre: string;
        maxOfertasActivas: number;
        incluyeDestacado: boolean;
        precioMensual: number;
        duracionMeses: number;
        fechaInicio: string; // viene serializada
        fechaFin: string;
    } | null;
    meta: {
        ofertasActivas: number;
        restantes: number;
        diasParaVencer: number | null;
        vencePronto: boolean;
        expirada: boolean;
    };
};

export function usePlanActual() {
    const { data, error, isLoading, mutate } = useSWR<PlanActual>("/api/suscripcion/mia", fetcher, {
        revalidateOnFocus: true,
    });

    return {
        plan: data?.plan ?? null,
        meta: data?.meta ?? null,
        isLoading,
        isError: !!error,
        refresh: mutate,
    };
}
