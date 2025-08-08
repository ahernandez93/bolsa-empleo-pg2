"use client"

import { DataTable } from "./data-table"
import { columns, EmpleadoConDatos } from "./columns"

export function ListEmpleados({ empleados }: { empleados: EmpleadoConDatos[] }) {
    return <DataTable columns={columns} data={empleados} />
}

