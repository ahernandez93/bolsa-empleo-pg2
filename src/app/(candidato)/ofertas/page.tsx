import { getOFertasLaboralesAbiertas } from "../../actions/ofertas-actions";
import OffersCatalog from "./OffersCatalog";
import { auth } from "@/lib/auth/auth";

export default async function OffersCatalogPage() {
    const session = await auth();
    const userId = session?.user?.id as string | undefined;
    const ofertasLaboralesAbiertas = await getOFertasLaboralesAbiertas(userId);

    return (
        <OffersCatalog ofertasLaboralesAbiertas={ofertasLaboralesAbiertas} />
    );
}
