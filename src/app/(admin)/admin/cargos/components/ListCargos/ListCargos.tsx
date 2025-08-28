"use client"

import { DataTable } from "./data-table"
import { getColumns, CargoData } from "./columns"
import { useState } from "react"
import axios from "axios"
import { FormCreateCargo } from "../FormCreateCargo"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ListCargosProps {
    cargos: CargoData[]
}

export function ListCargos({ cargos }: ListCargosProps) {
    const [editingCargo, setEditingCargo] = useState<CargoData | null>(null)
    const [openModalCreate, setOpenModalCreate] = useState(false);
    const router = useRouter()

    const handleEdit = async (cargo: CargoData) => {
        try {
            const res = await axios.get(`/api/cargos/${cargo.id}`)
            const cargoCompleto = res.data
            setEditingCargo(cargoCompleto)
            setOpenModalCreate(true)
        } catch (error) {
            console.error("Error al obtener detalles del cargo:", error)
            toast.error("Error al obtener detalles del cargo")
        }
    }

    const handleDelete = async (cargo: CargoData) => {
        const executeDelete = async () => {
            try {
                await axios.delete(`/api/cargos/${cargo.id}`);
                toast.success("Cargo eliminado correctamente");
                router.refresh();
            } catch (error) {
                console.error("Error al eliminar el cargo:", error);
                toast.error("Hubo un error al eliminar el cargo");
            }
        }

        toast(`¿Eliminar a ${cargo.descripcion}?`, {
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
            <DataTable columns={columns} data={cargos} />

            <Dialog open={openModalCreate} onOpenChange={setOpenModalCreate}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCargo ? "Editar Cargo" : "Nuevo Cargo"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCargo ? "Actualice los datos del cargo" : "Ingrese los datos del nuevo cargo"}
                        </DialogDescription>
                    </DialogHeader>

                    <FormCreateCargo
                        initialData={editingCargo}
                        setOpenModalCreate={setOpenModalCreate}
                        isEditMode={Boolean(editingCargo)}
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}
