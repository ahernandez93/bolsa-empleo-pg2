import { HeaderCandidatos } from "./components/HeaderCandidatos"
import { ListCandidatos } from "./components/ListCandidatos/ListCandidatos"
import { getCandidatos } from "@/app/actions/candidatos-actions"


export default async function EmpleadosPage() {
    const candidatos = await getCandidatos();

    return (
        <div className="p-6">
            <HeaderCandidatos />
            <ListCandidatos
                candidatos={candidatos}
            />
        </div>
    )
}
