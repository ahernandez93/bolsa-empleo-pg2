import useSWR from "swr";
import axios from "axios";
import type { EmpresaConfigDTO } from "@/types";

const fetcher = <T,>(url: string) => axios.get<T>(url).then(r => r.data);

type EmpresaResponse = { empresa: EmpresaConfigDTO };

export function useEmpresaConfig() {
    const { data, error, isLoading, mutate } = useSWR<EmpresaResponse>(
        "/api/empresa/config",
        fetcher<EmpresaResponse>
    );
    return {
        empresa: data?.empresa,
        isLoading,
        isError: Boolean(error),
        mutate,
    };
}
