"use client"

import { DataTable } from "./data-table"
import { getColumns, EmpleadoConDatos } from "./columns"
import { useState } from "react"
import axios from "axios"
import { FormCreateEmpleado } from "../FormCreateEmpleado"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EmpleadoCompleto } from "@/types"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { CargoItem } from "@/app/actions/cargos-actions"
import { DepartamentoItem } from "@/app/actions/departamentos-actions"

interface ListEmpleadosProps {
    empleados: EmpleadoConDatos[]
    departamentos: DepartamentoItem[]
    cargos: CargoItem[]
}

export function ListEmpleados({ empleados, departamentos, cargos }: ListEmpleadosProps) {
    const [editingEmpleado, setEditingEmpleado] = useState<EmpleadoCompleto | null>(null)
    const [openModalCreate, setOpenModalCreate] = useState(false);
    const router = useRouter()

    const handleEdit = async (empleado: EmpleadoConDatos) => {
        try {
            const res = await axios.get(`/api/empleados/${empleado.id}`)
            const empleadoCompleto = res.data
            setEditingEmpleado(empleadoCompleto)
            setOpenModalCreate(true)
        } catch (error) {
            console.error("Error al obtener detalles del empleado:", error)
            toast.error("Error al obtener detalles del empleado")
        }
    }

    const handleDelete = async (empleado: EmpleadoConDatos) => {
        const executeDelete = async () => {
            try {
                await axios.delete(`/api/empleados/${empleado.id}`);
                toast.success("Empleado eliminado correctamente");
                router.refresh();
            } catch (error) {
                console.error("Error al eliminar el empleado:", error);
                toast.error("Hubo un error al eliminar el empleado");
            }
        }

        toast(`¿Eliminar a ${empleado.nombre} ${empleado.apellido}?`, {
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
            <DataTable columns={columns} data={empleados} departamentos={departamentos} cargos={cargos} />

            <Dialog open={openModalCreate} onOpenChange={setOpenModalCreate}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingEmpleado ? "Editar Empleado" : "Nuevo Empleado"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingEmpleado ? "Actualice los datos del empleado" : "Ingrese los datos del nuevo empleado"}
                        </DialogDescription>
                    </DialogHeader>

                    <FormCreateEmpleado
                        initialData={editingEmpleado}
                        setOpenModalCreate={setOpenModalCreate}
                        isEditMode={Boolean(editingEmpleado)}
                        departamentos={departamentos}
                        cargos={cargos}
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}
