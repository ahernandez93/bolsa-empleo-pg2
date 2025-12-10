export const dynamic = "force-dynamic";

import { HeaderOfertasLaborales } from "./components/HeaderOfertasLaborales";
import { ListOfertasLaborales } from "./components/ListOfertas/ListOfertasLaborales";
import { getOfertasLaborales } from "@/app/actions/ofertas-actions";
import { getReclutadoresEmpresa } from "@/app/actions/empleados-actions";
import { requireEmpresaSession } from "@/lib/auth/guard";

export default async function OfertasLaboralesPage() {
    const ofertasLaborales = await getOfertasLaborales();
    const { rol } = await requireEmpresaSession();
    const reclutadores = await getReclutadoresEmpresa();

    return (
        <div className="p-6">
            <HeaderOfertasLaborales
                currentUserRole={rol as "ADMIN" | "RECLUTADOR" | "SUPERADMIN"}
                reclutadores={reclutadores}
            />
            <ListOfertasLaborales
                ofertasLaborales={ofertasLaborales}
                currentUserRole={rol as "ADMIN" | "RECLUTADOR" | "SUPERADMIN"}
                reclutadores={reclutadores}

            />
        </div>
    )
}
