"use client";
import { useMemo, useState } from "react";
import JobCard from "@/components/jobcard";
import type { JobCardProps } from "@/components/jobcarousel";
import { useSavedMap } from "@/hooks/use-saved-map";
import { useSession } from "next-auth/react";
import FiltersBar from "./FiltersBar";
import PaginationBar from "./PaginationBar";
import { Modalidad } from "@prisma/client";

export default function OffersCatalog({ ofertasLaboralesAbiertas }: { ofertasLaboralesAbiertas: JobCardProps[] }) {

    const { status, data } = useSession(); // "authenticated" | "unauthenticated" | "loading"
    const authed = status === "authenticated";
    const userId = authed ? (data?.user?.id ?? "anon") : "anon";

    const [query, setQuery] = useState("");
    const [category, setCategory] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [modality, setModality] = useState<Modalidad | "">("");

    const areaOptions = useMemo(() => {
        const set = new Set<string>();
        for (const j of ofertasLaboralesAbiertas) if (j.area) set.add(j.area);
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [ofertasLaboralesAbiertas]);

    const cityOptions = useMemo(() => {
        const set = new Set<string>();
        for (const j of ofertasLaboralesAbiertas) {
            if (j.ubicacionCiudadDescripcion) set.add(j.ubicacionCiudadDescripcion);
        }
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [ofertasLaboralesAbiertas]);

    const modalityOptions = useMemo(() => {
        const set = new Set<Modalidad>();
        for (const j of ofertasLaboralesAbiertas) if (j.modalidad) set.add(j.modalidad);
        return Array.from(set).sort();
    }, [ofertasLaboralesAbiertas]);

    const ids = useMemo(() => ofertasLaboralesAbiertas.map((j) => String(j.id)), [ofertasLaboralesAbiertas]);
    const { savedMap, mutate, isLoading } = useSavedMap(ids, userId);

    const filtered = useMemo(() => {
        return ofertasLaboralesAbiertas.filter((j) => {
            const q = query.toLowerCase().trim();
            const matchesQuery = !q ||
                j.puesto.toLowerCase().includes(q) ||
                j.empresa.toLowerCase().includes(q);
            const matchesCat = !category || j.area === category;
            const city = j.ubicacionCiudadDescripcion?.toLowerCase() ?? "";
            const matchesLoc = !location || city === location.toLowerCase();
            const matchesMod = !modality || j.modalidad === modality;
            return matchesQuery && matchesCat && matchesLoc && matchesMod;
        });
    }, [query, location, modality, category, ofertasLaboralesAbiertas]);

    return (
        <div className="min-h-screen bg-slate-50">
            <main className="mx-auto max-w-6xl px-4 py-6">
                <div className="flex items-end justify-between gap-3">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold">Ofertas</h1>
                        <p className="text-sm text-muted-foreground">Catalogo de ofertas laborales</p>
                    </div>
                </div>
                
                {<FiltersBar
                    query={query}
                    onQuery={setQuery}
                    category={category}
                    onCategory={setCategory}
                    location={location}
                    onLocation={setLocation}
                    modality={modality}
                    onModality={setModality}
                    areaOptions={areaOptions}
                    cityOptions={cityOptions}
                    modalityOptions={modalityOptions}
                />}

                {/* Grid de ofertas */}
                <section className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((job) => {
                        const key = String(job.id);
                        
                        const effectiveSaved = authed && !isLoading ? !!savedMap[key] : false;

                        return (
                            <JobCard key={key}
                                {...job}
                                isSaved={effectiveSaved}
                                onToggleSaved={(next) => {
                                    if (!authed) return;
                                    mutate((prev) => ({ ...(prev ?? {}), [key]: next }), { revalidate: false });
                                }}
                            />
                        )
                    })}
                </section>

                <PaginationBar />
            </main>
        </div>
    );
}

