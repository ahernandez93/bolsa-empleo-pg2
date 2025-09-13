"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, /* Filter, */ Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import JobCard from "@/components/jobcard";
import type { JobCardProps } from "@/components/jobcarousel";

/* type Job = {
    id: string;
    title: string;
    company: string;
    category: string;
    city: string;
    country: string;
    modality: "Remoto" | "Presencial" | "Híbrido";
    contract: "Tiempo completo" | "Temporal" | "Indefinido" | "Contrato";
    salary?: string; // "€45k–€60k"
    tags: string[]; // "SQL", "BI" etc
    summary: string;
}; */

/* const JOBS: Job[] = [
    {
        id: "1",
        title: "Frontend Developer",
        company: "Acme Inc.",
        category: "Desarrollo web",
        city: "Madrid",
        country: "ES",
        modality: "Remoto",
        contract: "Tiempo completo",
        salary: "€45k–€60k",
        tags: ["Presencial/Remoto"],
        summary:
            "Construye interfaces accesibles con React/TypeScript y colabora con diseño y producto para lanzar features de alto impacto.",
    },
    {
        id: "2",
        title: "Data Analyst",
        company: "Globex",
        category: "Análisis de datos",
        city: "Barcelona",
        country: "ES",
        modality: "Híbrido",
        contract: "Temporal",
        salary: "€35k–€45k",
        tags: ["SQL", "BI"],
        summary:
            "Analiza datasets complejos, crea dashboards y aporta insights accionables en colaboración con equipos de negocio.",
    },
    {
        id: "3",
        title: "Product Manager",
        company: "Nimbus",
        category: "Producto",
        city: "Remoto",
        country: "ES",
        modality: "Remoto",
        contract: "Tiempo completo",
        salary: "€60k–€80k",
        tags: ["B2B SaaS"],
        summary:
            "Lidera el ciclo de producto end‑to‑end, prioriza roadmap y coordina equipos cross‑funcionales para entregar valor.",
    },
    {
        id: "4",
        title: "Backend Engineer",
        company: "Skyline",
        category: "Desarrollo web",
        city: "Valencia",
        country: "ES",
        modality: "Presencial",
        contract: "Indefinido",
        salary: "€50k–€65k",
        tags: ["K8s", "AWS"],
        summary:
            "Diseña y mantiene microservicios escalables en Node/Go, con foco en performance y observabilidad.",
    },
    {
        id: "5",
        title: "UX/UI Designer",
        company: "Pixel Co.",
        category: "Diseño",
        city: "Remoto",
        country: "ES",
        modality: "Remoto",
        contract: "Contrato",
        salary: "€40k–€55k",
        tags: ["Figma", "Design System"],
        summary:
            "Crea experiencias consistentes y accesibles, prototipa en Figma y colabora estrechamente con desarrollo.",
    },
    {
        id: "6",
        title: "Customer Success",
        company: "CoreApps",
        category: "Atención al cliente",
        city: "Sevilla",
        country: "ES",
        modality: "Híbrido",
        contract: "Tiempo completo",
        salary: "€28k–€35k",
        tags: ["CS", "CRM"],
        summary:
            "Acompaña a clientes en adopción del producto, mejora NPS y comparte feedback con producto y ventas.",
    },
    {
        id: "7",
        title: "Marketing Specialist",
        company: "Bright",
        category: "Marketing",
        city: "Bilbao",
        country: "ES",
        modality: "Presencial",
        contract: "Temporal",
        salary: "€30k–€40k",
        tags: ["SEO", "Ads"],
        summary:
            "Define campañas multicanal, optimiza performance y colabora con contenidos para generar demanda.",
    },
    {
        id: "8",
        title: "QA Engineer",
        company: "Rigel",
        category: "Calidad",
        city: "Málaga",
        country: "ES",
        modality: "Híbrido",
        contract: "Indefinido",
        salary: "€35k–€48k",
        tags: ["Cypress", "QA"],
        summary:
            "Diseña planes de prueba, automatiza flujos críticos y mejora la calidad del software en cada release.",
    },
    {
        id: "9",
        title: "DevOps Engineer",
        company: "TurboTech",
        category: "Tecnología",
        city: "Remoto",
        country: "ES",
        modality: "Remoto",
        contract: "Tiempo completo",
        salary: "€55k–€75k",
        tags: ["Terraform", "CI/CD"],
        summary:
            "Automatiza pipelines CI/CD, gestiona infra como código y refuerza prácticas de seguridad.",
    },
]; */

export default function OffersCatalog({ ofertasLaboralesAbiertas }: { ofertasLaboralesAbiertas: JobCardProps[] }) {

    const [query, setQuery] = useState("");
    const [category, setCategory] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [modality, setModality] = useState<string>("");

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
    }, [query, location, modality, category]);

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
                    {filtered.map((job) => (
                        <JobCard key={job.id} {...job} />
                    ))}
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

// function JobCard({ job }: { job: Job }) {
//     return (
//         <Card className="flex h-full flex-col border-slate-200">
//             <CardHeader className="pb-2">
//                 <div className="flex items-start gap-2">
//                     <Avatar className="h-8 w-8"><AvatarFallback>{job.company[0]}</AvatarFallback></Avatar>
//                     <div className="min-w-0">
//                         <CardTitle className="text-lg leading-tight text-slate-900">{job.title}</CardTitle>
//                         <p className="truncate text-xs text-slate-500">{job.company} • {job.city}, {job.country}</p>
//                     </div>
//                 </div>
//             </CardHeader>
//             <CardContent className="flex flex-1 flex-col justify-between gap-3">
//                 <div>
//                     <div className="mb-2 flex flex-wrap gap-2 text-xs">
//                         <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">{job.modality}</span>
//                         <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">{job.contract}</span>
//                     </div>
//                     <p className="line-clamp-3 text-sm text-slate-700">{job.summary}</p>
//                     <div className="mt-2 flex flex-wrap gap-2 text-xs">
//                         {/* {job.salary && (
//                             <span className="rounded-full bg-slate-900/90 px-2.5 py-1 text-white">{job.salary}</span>
//                         )} */}
//                         {job.tags.map((t) => (
//                             <span key={t} className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">{t}</span>
//                         ))}
//                     </div>
//                 </div>
//                 <div className="flex items-center justify-between gap-2 pt-1">
//                     {/* <Button variant="outline" className="w-full">Ver detalles</Button> */}
//                     <Button className="w-full">Aplicar ahora</Button>
//                 </div>
//                 <div className="flex gap-2 pt-1 text-sm text-slate-500 justify-end">
//                     <span>Publicada{" "}
//                         {formatDistanceToNow(new Date("2025-08-30T12:00:00.000Z"), {
//                             addSuffix: true,
//                             locale: es,
//                         })}</span>
//                 </div>
//             </CardContent>
//         </Card>
//     );
// }

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