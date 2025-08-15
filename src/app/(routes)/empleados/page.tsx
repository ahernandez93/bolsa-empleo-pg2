import { HeaderEmpleados } from "./components/HeaderEmpleados"
import { ListEmpleados } from "./components/ListEmpleados/ListEmpleados"
// import axios from "axios"
// import { prisma } from "@/lib/prisma"
// import { headers } from 'next/headers'
import { getEmpleados } from "@/app/actions/empleados-actions"
import { getDepartamentos } from "@/app/actions/departamentos-actions"
import { getCargos } from "@/app/actions/cargos-actions"

/* async function getEmpleados() {
    try {
        console.log("Fetching empleados...");

        const requestHeaders = await headers();
        const cookie = requestHeaders.get('cookie');

        const response = await axios.get("http://localhost:3000/api/empleados", {
            headers: {
                "Cache-Control": "no-store",
                "Cookie": cookie || "",
            },
        });

        const data = response.data;
        console.log("API response received:", data);
        return data.empleados || [];

    } catch (error) {
        console.error("Error fetching empleados:", error);
        return [];
    }
} */

export default async function EmpleadosPage() {
    const empleados = await getEmpleados();
    const departamentos = await getDepartamentos();
    const cargos = await getCargos();

    return (
        <div className="p-6">
            <HeaderEmpleados
                departamentos={departamentos ?? []}
                cargos={cargos ?? []}
            />
            <ListEmpleados
                empleados={empleados}
                departamentos={departamentos ?? []}
                cargos={cargos ?? []}
            />
        </div>
    )
}
