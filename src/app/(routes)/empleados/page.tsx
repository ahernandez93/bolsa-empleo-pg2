import { HeaderEmpleados } from "./components/HeaderEmpleados"
import { ListEmpleados } from "./components/ListEmpleados/ListEmpleados"
// import axios from "axios"
// import { prisma } from "@/lib/prisma"
// import { headers } from 'next/headers'
import { getEmpleados } from "@/app/actions/empleados-actions"

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

    return (
        <div className="p-6">
            <HeaderEmpleados />
            <ListEmpleados empleados={empleados} />
        </div>
    )
}
