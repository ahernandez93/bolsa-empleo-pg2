import OfertaDetailClient from "./OfertaDetailClient";
export const runtime = "nodejs";

type Params = { id: string };

export default async function OfertaDetailPage({ params }: { params: Promise<Params>}) {
    const { id } = await Promise.resolve(params);
    return <OfertaDetailClient id={id} />;
}