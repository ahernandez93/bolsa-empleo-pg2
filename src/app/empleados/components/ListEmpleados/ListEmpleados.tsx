"use client"

import { DataTable } from "./data-table"
import { getColumns, EmpleadoConDatos } from "./columns"
import { useState } from "react"
import axios from "axios"
import { FormCreateEmpleado } from "../CreateFormEmpleado"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EmpleadoCompleto } from "@/types"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ListEmpleados({ empleados }: { empleados: EmpleadoConDatos[] }) {
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
        // Función para ejecutar la eliminación
        const executeDelete = async () => {
            try {
                await axios.delete(`/api/empleados/${empleado.id}`);
                toast.success("Empleado eliminado correctamente");
                router.refresh(); // Recarga solo los datos
            } catch (error) {
                console.error("Error al eliminar el empleado:", error);
                toast.error("Hubo un error al eliminar el empleado");
            }
        }

        // Toast de confirmación con botones de acción
        toast(`¿Eliminar a ${empleado.nombre} ${empleado.apellido}?`, {
            description: "Esta acción no se puede deshacer",
            action: {
                label: "Eliminar",
                onClick: executeDelete,
            },
            cancel: {
                label: "Cancelar",
                onClick: () => {
                    // Opcional: toast de cancelación
                    // toast.info("Eliminación cancelada")
                }
            },
            duration: 10000, // 10 segundos para que el usuario tenga tiempo de decidir
        })
    }
    const columns = getColumns({ onEdit: handleEdit, onDelete: handleDelete })

    return (
        <>
            <DataTable columns={columns} data={empleados} />

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
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}
