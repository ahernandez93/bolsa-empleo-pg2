"use client"

import { DataTable } from "./data-table"
import { getColumns, OfertaLaboralConDatos } from "./columns"
import { useState } from "react"
import axios from "axios"
import { FormCreateOferta } from "../FormCreateOferta"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { OfertaLaboralCompleta } from "@/types"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { OfertaLaboral } from "@prisma/client";

interface ListEmpleadosProps {
    ofertasLaborales: OfertaLaboralConDatos[]
}

export function ListOfertasLaborales({ ofertasLaborales }: ListEmpleadosProps) {
    const [editingOferta, setEditingOferta] = useState<OfertaLaboral | null>(null)
    const [openModalCreate, setOpenModalCreate] = useState(false);
    const router = useRouter()

    const handleEdit = async (ofertaLaboral: OfertaLaboralConDatos) => {
        try {
            const res = await axios.get(`/api/ofertaslaborales/${ofertaLaboral.id}`)
            const ofertaLaboralCompleta = res.data
            setEditingOferta(ofertaLaboralCompleta)
            setOpenModalCreate(true)
        } catch (error) {
            console.error("Error al obtener detalles del empleado:", error)
            toast.error("Error al obtener detalles del empleado")
        }
    }

    const handleDelete = async (ofertaLaboral: OfertaLaboralConDatos) => {
        const executeDelete = async () => {
            try {
                await axios.delete(`/api/ofertaslaborales/${ofertaLaboral.id}`);
                toast.success("Oferta Laboral eliminada correctamente");
                router.refresh();
            } catch (error) {
                console.error("Error al eliminar el empleado:", error);
                toast.error("Hubo un error al eliminar el empleado");
            }
        }

        toast(`¿Eliminar a ${ofertaLaboral.puesto}?`, {
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
            <DataTable columns={columns} data={ofertasLaborales} />

            <Dialog open={openModalCreate} onOpenChange={setOpenModalCreate}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingOferta ? "Editar Oferta Laboral" : "Nueva Oferta Laboral"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingOferta ? "Actualice los datos de la oferta laboral" : "Ingrese los datos de la nueva oferta laboral"}
                        </DialogDescription>
                    </DialogHeader>

                    {/* <FormCreateOferta
                        initialData={editingOferta}
                        setOpenModalCreate={setOpenModalCreate}
                        isEditMode={Boolean(editingOferta)}
                    /> */}
                </DialogContent>
            </Dialog>
        </>
    )
}
