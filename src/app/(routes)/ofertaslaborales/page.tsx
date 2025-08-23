import { HeaderOfertasLaborales } from "./components/HeaderOfertasLaborales";
// import { ListOfertasLaborales } from "./components/ListOfertasLaborales";

export default function OfertasLaboralesPage() {
    return (
        <div className="p-6">
            <HeaderOfertasLaborales />
            {/* <ListOfertasLaborales
                ofertasLaborales={ofertasLaborales}
                departamentos={departamentos ?? []}
                cargos={cargos ?? []}
            /> */}
        </div>
    )
}
