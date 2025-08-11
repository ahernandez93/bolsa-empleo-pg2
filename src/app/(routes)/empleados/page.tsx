import { HeaderEmpleados } from "./components/HeaderEmpleados"
import { ListEmpleados } from "./components/ListEmpleados/ListEmpleados"
import axios from "axios"

export default async function Empleados() {
    async function getEmpleados() {
        try {
            const { data } = await axios.get("http://localhost:3000/api/empleados",
                {
                    headers: {
                        "Cache-Control": "no-store",
                    },
                }
            )
            return data
        } catch (error) {
            console.error("Error al obtener empleados:", error)
            throw new Error("Error al obtener empleados")
        }
    }

    const { empleados } = await getEmpleados()

    return (
        <div className="p-6">
            <HeaderEmpleados />

            
            <ListEmpleados empleados={empleados} />
        </div>
    )
}
