import useSWR from "swr";
import axios from "axios";
import type { EmpleadoPerfilDTO } from "@/types";


const fetcher = (url: string) => axios.get(url).then(r => r.data);

type PerfilResponse = { perfil: EmpleadoPerfilDTO };


export function useEmpleadoPerfil() {
    const { data, error, isLoading, mutate } = useSWR<PerfilResponse>("/api/empleados/perfil", fetcher);
    return {
        perfil: data?.perfil,
        isLoading,
        isError: !!error,
        mutate,
    };
}
