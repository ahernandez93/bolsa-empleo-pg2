import { HeaderDepartamentos } from "./components/HeaderDepartamentos";
// import { ListDepartamentos } from "./components/ListDepartamentos";
// import { getDepartamentos } from "@/app/actions/departamentos-actions";

export default async function Departamentos() {
    // const departamentos = await getDepartamentos();

    return (
        <div className="p-6">
            <HeaderDepartamentos />
            {/* <ListDepartamentos departamentos={departamentos} /> */}
        </div>
    )
}
