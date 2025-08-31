"use client"

import { DataTable } from "./data-table"
import { getColumns, PostulacionConDatos } from "./columns"
import { useState } from "react"
import axios from "axios"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
// import { OfertaLaboralUpdateData } from "@/lib/schemas/ofertaLaboralSchema";
import { InitialDataUpdateOfertaLaboral } from "@/types"

interface ListPostulacionesProps {
    postulaciones: PostulacionConDatos[]
}

export function ListPostulaciones({ postulaciones }: ListPostulacionesProps) {
    const [editingPostulacion, setEditingPostulacion] = useState<InitialDataUpdateOfertaLaboral | null>(null)
    const [openModalCreate, setOpenModalCreate] = useState(false);
    const router = useRouter()

    const handleEdit = async (postulacion: PostulacionConDatos) => {
        try {
            const res = await axios.get(`/api/postulaciones/${postulacion.id}`)
            const postulacionCompleta = res.data
            setEditingPostulacion(postulacionCompleta)
            setOpenModalCreate(true)
        } catch (error) {
            console.error("Error al obtener detalles del empleado:", error)
            toast.error("Error al obtener detalles del empleado")
        }
    }

    const handleDelete = async (postulacion: PostulacionConDatos) => {
        const executeDelete = async () => {
            try {
                await axios.delete(`/api/postulaciones/${postulacion.id}`);
                toast.success("Postulación eliminada correctamente");
                router.refresh();
            } catch (error) {
                console.error("Error al eliminar el empleado:", error);
                toast.error("Hubo un error al eliminar el empleado");
            }
        }

        toast(`¿Eliminar a ${postulacion.perfilUsuarioNombre}?`, {
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
    const columns = getColumns({ onEdit: handleEdit, onDelete: handleDelete })

    return (
        <>
            <DataTable columns={columns} data={postulaciones} />

            <Dialog open={openModalCreate} onOpenChange={setOpenModalCreate}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPostulacion ? "Editar Postulación" : "Nueva Postulación"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingPostulacion ? "Actualice los datos de la postulación" : "Ingrese los datos de la nueva postulación"}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    )
}
