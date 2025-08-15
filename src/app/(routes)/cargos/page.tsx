import { HeaderCargos } from "./components/HeaderCargos";
// import { ListCargos } from "./components/ListCargos";
// import { getCargos } from "@/app/actions/cargos-actions";

export default async function Cargos() {
    // const cargos = await getCargos();

    return (
        <div className="p-6">
            <HeaderCargos />
            {/* <ListCargos cargos={cargos} /> */}
        </div>
    )
}