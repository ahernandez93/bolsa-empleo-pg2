import { getOFertasLaboralesAbiertas } from "../../actions/ofertas-actions";
import OffersCatalog from "./OffersCatalog";

const ofertasLaboralesAbiertas = await getOFertasLaboralesAbiertas();

export default function OffersCatalogPage() {
    return (
        <OffersCatalog ofertasLaboralesAbiertas={ofertasLaboralesAbiertas} />
    );
}
