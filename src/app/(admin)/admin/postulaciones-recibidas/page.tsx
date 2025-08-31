import { HeaderPostulaciones } from "./components/HeaderPostulaciones";
import { ListPostulaciones } from "./components/ListPostulaciones/ListPostulaciones";
import { getPostulaciones } from "@/app/actions/postulaciones-actions";

export default async function PostulacionesPage() {
    const postulaciones = await getPostulaciones();
    return (
        <div className="p-6">
            <HeaderPostulaciones />
            <ListPostulaciones
                postulaciones={postulaciones}
            />
        </div>
    )
}