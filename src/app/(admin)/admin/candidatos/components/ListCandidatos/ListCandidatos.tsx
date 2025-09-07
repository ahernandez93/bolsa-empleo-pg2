"use client"

import { DataTable } from "./data-table"
import { getColumns, CandidatoConDatos } from "./columns"
import axios from "axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ListCandidatosProps {
    candidatos: CandidatoConDatos[]
}

export function ListCandidatos({ candidatos }: ListCandidatosProps) {
    const router = useRouter()

    const handleDelete = async (candidato: CandidatoConDatos) => {
        const executeDelete = async () => {
            try {
                await axios.delete(`/api/candidatos/${candidato.id}`);
                toast.success("Candidato eliminado correctamente");
                router.refresh();
            } catch (error) {
                console.error("Error al eliminar el candidato:", error);
                toast.error("Hubo un error al eliminar el candidato");
            }
        }

        toast(`¿Eliminar al candidato ${candidato.nombre} ${candidato.apellido}?`, {
            description: "Esta acción no se puede deshacer",
            action: {
                label: "Eliminar",
                onClick: executeDelete,
            },
            cancel: {
                label: "Cancelar",
                onClick: () => {
                    toast.info("Eliminación cancelada")
                }
            },
            duration: 10000,
        })
    }
    const columns = getColumns({ onDelete: handleDelete })

    return (
        <>
            <DataTable columns={columns} data={candidatos} />
        </>
    )
}
