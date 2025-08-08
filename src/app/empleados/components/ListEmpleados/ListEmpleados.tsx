"use client"

import { DataTable } from "./data-table"
import { getColumns, EmpleadoConDatos } from "./columns"
import { useState } from "react"
import axios from "axios"
import { FormCreateEmpleado } from "../CreateFormEmpleado"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EmpleadoCompleto } from "@/types"

export function ListEmpleados({ empleados }: { empleados: EmpleadoConDatos[] }) {
    const [editingEmpleado, setEditingEmpleado] = useState<EmpleadoCompleto | null>(null)
    const [openModalCreate, setOpenModalCreate] = useState(false);

    const handleEdit = async (empleado: EmpleadoConDatos) => {
        try {
            const res = await axios.get(`/api/empleados/${empleado.id}`)
            const empleadoCompleto = res.data
            setEditingEmpleado(empleadoCompleto)
            setOpenModalCreate(true)
        } catch (error) {
            console.error("Error al obtener detalles del empleado:", error)
        }
    }

    const handleDelete = async (empleado: EmpleadoConDatos) => {
        try {
            console.log("Eliminando empleado", empleado)
            // await axios.delete(`/api/empleados/${empleado.id}`)
            // toast.success("Empleado eliminado correctamente")
            // refrescar página si quieres:
            // router.refresh()
        } catch (error) {
            // toast.error("Error al eliminar el empleado")
            // console.error(error)
        }
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

