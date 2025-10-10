import OfertaDetailClient from "./OfertaDetailClient";

export default function OfertaDetailPage({ params }: { params: { id: string } }) {
    return <OfertaDetailClient id={params.id} />;
}