import { HeaderOfertasLaborales } from "./components/HeaderOfertasLaborales";
import { ListOfertasLaborales } from "./components/ListOfertas/ListOfertasLaborales";
import { getOfertasLaborales } from "@/app/actions/ofertas-actions";

export default async function OfertasLaboralesPage() {
    const ofertasLaborales = await getOfertasLaborales();
    return (
        <div className="p-6">
            <HeaderOfertasLaborales />
            <ListOfertasLaborales
                ofertasLaborales={ofertasLaborales}
            />
        </div>
    )
}
