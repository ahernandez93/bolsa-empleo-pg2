"use client"

import { DataTable } from "./data-table"
import { getColumns, OfertaLaboralConDatos } from "./columns"
import { useState } from "react"
import axios from "axios"
import { FormCreateOferta } from "../FormCreateOferta"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
// import { OfertaLaboralUpdateData } from "@/lib/schemas/ofertaLaboralSchema";
import { InitialDataUpdateOfertaLaboral } from "@/types"

interface ListEmpleadosProps {
    ofertasLaborales: OfertaLaboralConDatos[]
}

export function ListOfertasLaborales({ ofertasLaborales }: ListEmpleadosProps) {
    const [editingOferta, setEditingOferta] = useState<InitialDataUpdateOfertaLaboral | null>(null)
    const [openModalCreate, setOpenModalCreate] = useState(false);
    const router = useRouter()

    const handleEdit = async (ofertaLaboral: OfertaLaboralConDatos) => {
        try {
            const res = await axios.get(`/api/ofertaslaborales/${ofertaLaboral.id}`)
            const ofertaLaboralCompleta = res.data
            setEditingOferta(ofertaLaboralCompleta)
            setOpenModalCreate(true)
        } catch (error) {
            console.error("Error al obtener detalles de la oferta laboral:", error)
            toast.error("Error al obtener detalles de la oferta laboral")
        }
    }

    const handleDelete = async (ofertaLaboral: OfertaLaboralConDatos) => {
        const executeDelete = async () => {
            try {
                await axios.delete(`/api/ofertaslaborales/${ofertaLaboral.id}`);
                toast.success("Oferta Laboral eliminada correctamente");
                router.refresh();
            } catch (error) {
                console.error("Error al eliminar la oferta laboral:", error);
                toast.error("Hubo un error al eliminar la oferta laboral");
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
                <DialogContent className="sm:max-w-4xl p-0 bg-background border shadow-lg">
                    <DialogHeader className="px-6 pt-6">
                        <DialogTitle>
                            {editingOferta ? "Editar Oferta Laboral" : "Nueva Oferta Laboral"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingOferta ? "Actualice los datos de la oferta laboral" : "Ingrese los datos de la nueva oferta laboral"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="px-6 pb-6 max-h-[80vh] overflow-y-auto">
                        <FormCreateOferta
                            initialData={editingOferta}
                            setOpenModalCreate={setOpenModalCreate}
                            isEditMode={Boolean(editingOferta)}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
