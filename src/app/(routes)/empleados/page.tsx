import { HeaderEmpleados } from "./components/HeaderEmpleados"
import { ListEmpleados } from "./components/ListEmpleados/ListEmpleados"
import axios from "axios"
// import { prisma } from "@/lib/prisma"
import { headers } from 'next/headers'

async function getEmpleados() {
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

    /* try {
        console.log("Fetching empleados directly from database...");
        const empleados = await prisma.empleado.findMany({
            include: {
                usuario: {
                    include: {
                        persona: true,
                    },
                },
            },
        });

        // Mapeamos los datos al formato que espera el componente DataTable
        const data = empleados.map(emp => ({
            id: emp.id,
            nombre: emp.usuario.persona.nombre,
            apellido: emp.usuario.persona.apellido,
            email: emp.usuario.email,
            telefono: emp.usuario.persona.telefono ?? undefined,
            rol: emp.usuario.rol,
            departamento: emp.departamento,
            cargo: emp.cargo,
            activo: emp.usuario.activo,
            createdAt: emp.createdAt.toISOString(),
        }));

        console.log(`Found ${data.length} empleados.`);
        return data;

    } catch (error) {
        console.error("Error fetching empleados from database:", error);
        // En caso de error, siempre devolver un array vacío.
        return [];
    } */
}

export default async function EmpleadosPage() {
    const empleados = await getEmpleados();
    console.log(`Rendering EmpleadosPage with ${empleados.length} empleados.`);

    return (
        <div className="p-6">
            <HeaderEmpleados />
            <ListEmpleados empleados={empleados} />
        </div>
    )
}
