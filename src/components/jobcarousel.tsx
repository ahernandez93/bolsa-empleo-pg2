"use client";

import { useRef, useCallback, useState, useEffect, useMemo } from "react";
import { Modalidad, TipoTrabajo } from "@prisma/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import JobCard from "@/components/jobcard";
import { useSavedMap } from "@/hooks/use-saved-map";

export type JobCardProps = {
    id: string;
    puesto: string;
    descripcionPuesto: string;
    area: string;
    ubicacionDepartamentoId: number;
    ubicacionDepartamentoDescripcion: string | undefined;
    ubicacionCiudadId: number;
    ubicacionCiudadDescripcion: string | undefined;
    empresa: string;
    nivelAcademico: string;
    experienciaLaboral: string;
    tipoTrabajo: TipoTrabajo;
    modalidad: Modalidad;
    fechaCreacion: Date;
    alreadyApplied?: boolean;
    isSaved?: boolean;
};

export default function JobsCarousel({ jobs }: { jobs: JobCardProps[] }) {
    const ref = useRef<HTMLDivElement>(null);
    const [atStart, setAtStart] = useState(true);
    const [atEnd, setAtEnd] = useState(false);

    const ids = useMemo(() => jobs.map(j => j.id), [jobs]);
    const { savedMap, mutate } = useSavedMap(ids);

    const updateEdges = useCallback(() => {
        const el = ref.current;
        if (!el) return;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        setAtStart(scrollLeft <= 0);
        setAtEnd(scrollLeft + clientWidth >= scrollWidth - 1);
    }, []);

    useEffect(() => {
        updateEdges();
        const el = ref.current;
        if (!el) return;
        el.addEventListener("scroll", updateEdges, { passive: true });
        window.addEventListener("resize", updateEdges);
        return () => {
            el.removeEventListener("scroll", updateEdges);
            window.removeEventListener("resize", updateEdges);
        };
    }, [updateEdges]);

    const handleArrow = (dir: "left" | "right") => {
        const el = ref.current;
        if (!el) return;

        // Delta: ~90% del ancho visible (se siente mejor que un “poquito” fijo)
        const delta = Math.round(el.clientWidth * 0.9) * (dir === "left" ? -1 : 1);
        el.scrollBy({ left: delta, behavior: "smooth" });
    };

    return (
        <div className="relative">
            {/* Botón Izquierdo */}
            <div className="absolute -left-2 top-1/2 hidden -translate-y-1/2 md:block">
                <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow"
                    onClick={() => handleArrow("left")}
                    disabled={atStart}
                    aria-label="Desplazar a la izquierda"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            </div>

            {/* Botón Derecho */}
            <div className="absolute -right-2 top-1/2 hidden -translate-y-1/2 md:block">
                <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow"
                    onClick={() => handleArrow("right")}
                    disabled={atEnd}
                    aria-label="Desplazar a la derecha"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <div
                ref={ref}
                className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 py-2 pr-2"
                style={{ scrollBehavior: "smooth" }}
                aria-label="Ofertas destacadas"
            >
                {jobs.map((job) => {
                    const effectiveSaved = savedMap[job.id] ?? job.isSaved; // SWR > SSR
                    return (
                        <div key={job.id} className="min-w-[300px] max-w-[320px] snap-start">
                            <JobCard
                                {...job}
                                isSaved={effectiveSaved}
                                onToggleSaved={(next) => {
                                    // Actualiza SWR al instante sin revalidar
                                    mutate((prev) => ({ ...(prev ?? {}), [job.id]: next }), { revalidate: false });
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
