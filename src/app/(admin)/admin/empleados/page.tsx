import { HeaderEmpleados } from "./components/HeaderEmpleados"
import { ListEmpleados } from "./components/ListEmpleados/ListEmpleados"
import { getEmpleados } from "@/app/actions/empleados-actions"
import { getDepartamentosHabilitados } from "@/app/actions/departamentos-actions"
import { getCargos } from "@/app/actions/cargos-actions"

export default async function EmpleadosPage() {
    const empleados = await getEmpleados();
    const departamentos = await getDepartamentosHabilitados();
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
