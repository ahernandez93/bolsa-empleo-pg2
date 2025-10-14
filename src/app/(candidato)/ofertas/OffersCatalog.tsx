"use client";
import { useMemo, useState } from "react";
import JobCard from "@/components/jobcard";
import type { JobCardProps } from "@/components/jobcarousel";
import { useSavedMap } from "@/hooks/use-saved-map";
import { useSession } from "next-auth/react";
import FiltersBar from "./FiltersBar";
import PaginationBar from "./PaginationBar";

export default function OffersCatalog({ ofertasLaboralesAbiertas }: { ofertasLaboralesAbiertas: JobCardProps[] }) {

    const { status, data } = useSession(); // "authenticated" | "unauthenticated" | "loading"
    const authed = status === "authenticated";
    const userId = authed ? (data?.user?.id ?? "anon") : "anon";

    const [query, setQuery] = useState("");
    const [category, setCategory] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [modality, setModality] = useState<string>("");

    const ids = useMemo(() => ofertasLaboralesAbiertas.map(j => j.id), [ofertasLaboralesAbiertas]);
    const { savedMap, mutate, isLoading } = useSavedMap(ids, userId);

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
                        const key = String(job.id);
                        // 🔑 Política:
                        // - sin sesión o cargando: false
                        // - con sesión: solo SWR; si aún no llegó, false
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

