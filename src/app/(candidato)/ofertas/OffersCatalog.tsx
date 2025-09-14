"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import JobCard from "@/components/jobcard";
import type { JobCardProps } from "@/components/jobcarousel";
import { useSavedMap } from "@/hooks/use-saved-map";

export default function OffersCatalog({ ofertasLaboralesAbiertas }: { ofertasLaboralesAbiertas: JobCardProps[] }) {

    const [query, setQuery] = useState("");
    const [category, setCategory] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [modality, setModality] = useState<string>("");

    const ids = useMemo(() => ofertasLaboralesAbiertas.map(j => j.id), [ofertasLaboralesAbiertas]);
    const { savedMap, mutate } = useSavedMap(ids);

    const filtered = useMemo(() => {
        return ofertasLaboralesAbiertas.filter((j) => {
            const q = query.toLowerCase();
            const matchesQuery = !q ||
                j.puesto.toLowerCase().includes(q) ||
                j.empresa.toLowerCase().includes(q);
            const matchesCat = !category || j.area === category;
            const matchesLoc = !location || j.ubicacionCiudadDescripcion?.toLowerCase().includes(location.toLowerCase());
            const matchesMod = !modality || j.modalidad === modality;
            return matchesQuery && matchesCat && matchesLoc && matchesMod;
        });
    }, [query, location, modality, category, ofertasLaboralesAbiertas]);

    return (
        <div className="min-h-screen bg-slate-50">
            <main className="mx-auto max-w-6xl px-4 py-6">
                {<FiltersBar
                    query={query}
                    onQuery={setQuery}
                    category={category}
                    onCategory={setCategory}
                    location={location}
                    onLocation={setLocation}
                    modality={modality}
                    onModality={setModality}
                />}

                {/* Chips rápidos */}
                {/* <div className="mt-3 flex flex-wrap items-center gap-2">
                    {[
                        "Remoto",
                        "Tiempo completo",
                        "Junior",
                        "Producto",
                    ].map((c) => (
                        <Badge key={c} variant="secondary" className="rounded-full">{c}</Badge>
                    ))}
                </div> */}

                {/* Encabezado de resultados */}
                {/* <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
                    <div>Mostrando <span className="font-medium text-slate-900">{filtered.length}</span> resultados</div>
                    <div className="flex items-center gap-4">
                        <button className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900">
                            <Filter className="h-4 w-4" /> Filtros activos: <span className="font-medium text-slate-900">3</span>
                        </button>
                        <div>
                            Ordenar: <span className="font-medium text-slate-900">Relevancia</span>
                        </div>
                    </div>
                </div> */}

                {/* Grid de ofertas */}
                <section className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((job) => {
                        const effectiveSaved = savedMap[job.id] ?? job.isSaved;
                        return (
                            <JobCard key={job.id}
                                {...job}
                                isSaved={effectiveSaved}
                                onToggleSaved={(next) => {
                                    mutate((prev) => ({ ...(prev ?? {}), [job.id]: next }), { revalidate: false });
                                }} />
                        )
                    })}
                </section>

                {/* Paginación */}
                <PaginationBar />
            </main>
        </div>
    );
}

function FiltersBar({
    query,
    onQuery,
    category,
    onCategory,
    location,
    onLocation,
    modality,
    onModality,
}: {
    query: string; onQuery: (v: string) => void;
    category: string; onCategory: (v: string) => void;
    location: string; onLocation: (v: string) => void;
    modality: string; onModality: (v: string) => void;
}) {
    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                    value={query}
                    onChange={(e) => onQuery(e.target.value)}
                    placeholder="Puesto, empresa o palabra clave"
                    className="pl-9"
                />
            </div>
            {/* Selects */}
            <Select value={category} onValueChange={onCategory}>
                <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Area" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="0">Todas</SelectItem>
                    <SelectItem value="Tecnología">Tecnología</SelectItem>
                    <SelectItem value="Producto">Producto</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                </SelectContent>
            </Select>

            <Select value={location} onValueChange={onLocation}>
                <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Ubicación" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="0">Todas</SelectItem>
                    <SelectItem value="Madrid">San Pedro Sula</SelectItem>
                    <SelectItem value="Barcelona">Choloma</SelectItem>
                    <SelectItem value="Remoto">Puerto Cortes</SelectItem>
                </SelectContent>
            </Select>

            <Select value={modality} onValueChange={onModality}>
                <SelectTrigger className="w-full md:w-44">
                    <SelectValue placeholder="Modalidad" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="0">Todas</SelectItem>
                    <SelectItem value="Remoto">Remoto</SelectItem>
                    <SelectItem value="Presencial">Presencial</SelectItem>
                    <SelectItem value="Híbrido">Híbrido</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

function PaginationBar() {
    return (
        <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1"><ChevronLeft className="h-4 w-4" /> Anterior</Button>
                <div className="flex items-center gap-1">
                    {[1, 2, 3].map((n) => (
                        <Button key={n} variant={n === 1 ? "default" : "outline"} size="sm">{n}</Button>
                    ))}
                </div>
                <Button variant="outline" size="sm" className="gap-1">Siguiente <ChevronRight className="h-4 w-4" /></Button>
            </div>
            {/* <Button variant="secondary">Cargar más</Button> */}
        </div>
    );
}