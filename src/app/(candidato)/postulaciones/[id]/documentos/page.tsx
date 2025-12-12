import DocumentosPostulacionClient from "./DocumentosPostulacionClient";

type Params = {
    id: string;
};

export default async function DocumentosPostulacionPage({ params }: { params: Promise<Params> }) {
    const { id } = await params;

    return <DocumentosPostulacionClient postulacionId={id} />;
}
