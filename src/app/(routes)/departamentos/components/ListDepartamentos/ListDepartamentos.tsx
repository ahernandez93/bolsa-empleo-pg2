"use client"

import { DataTable } from "./data-table"
import { getColumns, DepartamentoData } from "./columns"
import { useState } from "react"
import axios from "axios"
import { FormCreateDepartamento } from "../FormCreateDepartamento"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ListDepartamentosProps {
    departamentos: DepartamentoData[]
}

export function ListDepartamentos({ departamentos }: ListDepartamentosProps) {
    const [editingDepartamento, setEditingDepartamento] = useState<DepartamentoData | null>(null)
    const [openModalCreate, setOpenModalCreate] = useState(false);
    const router = useRouter()

    const handleEdit = async (departamento: DepartamentoData) => {
        try {
            const res = await axios.get(`/api/departamentos/${departamento.id}`)
            const departamentoCompleto = res.data
            setEditingDepartamento(departamentoCompleto)
            setOpenModalCreate(true)
        } catch (error) {
            console.error("Error al obtener detalles del empleado:", error)
            toast.error("Error al obtener detalles del empleado")
        }
    }

    const handleDelete = async (departamento: DepartamentoData) => {
        const executeDelete = async () => {
            try {
                await axios.delete(`/api/departamentos/${departamento.id}`);
                toast.success("Departamento eliminado correctamente");
                router.refresh();
            } catch (error) {
                console.error("Error al eliminar el empleado:", error);
                toast.error("Hubo un error al eliminar el empleado");
            }
        }

        toast(`¿Eliminar a ${departamento.descripcion}?`, {
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
            <DataTable columns={columns} data={departamentos} />

            <Dialog open={openModalCreate} onOpenChange={setOpenModalCreate}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingDepartamento ? "Editar Departamento" : "Nuevo Departamento"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingDepartamento ? "Actualice los datos del departamento" : "Ingrese los datos del nuevo departamento"}
                        </DialogDescription>
                    </DialogHeader>

                    <FormCreateDepartamento
                        initialData={editingDepartamento}
                        setOpenModalCreate={setOpenModalCreate}
                        isEditMode={Boolean(editingDepartamento)}
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}
