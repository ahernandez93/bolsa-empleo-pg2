"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileView from "@/components/perfilcandidatos/ProfileView";
import ProfileEditForm from "@/components/perfilcandidatos/ProfileEditForm";
import type { PerfilCandidatoFormValues } from "@/lib/schemas/perfilCandidatoSchema";
import { useState, useEffect } from "react";
import useSWR from "swr";
import axios from "axios";

export default function ProfileTabs({ initialData, onSaved }: { initialData: PerfilCandidatoFormValues; onSaved?: (updated: PerfilCandidatoFormValues) => void }) {
    const [viewData, setViewData] = useState<PerfilCandidatoFormValues>(initialData);

    useEffect(() => {
        setViewData(initialData);
    }, [initialData]);

    const handleSaved = (updated: PerfilCandidatoFormValues) => {
        setViewData(updated);
        onSaved?.(updated);
    };

    return (
        <Tabs defaultValue="view" className="md:col-span-2">
            <div className="flex items-center justify-between">
                <TabsList>
                    <TabsTrigger value="view">Perfil</TabsTrigger>
                    <TabsTrigger value="edit">Editar</TabsTrigger>
                </TabsList>
            </div>


            <div className="grid gap-4 md:grid-cols-[1fr_320px]">
                <TabsContent value="view" className="md:col-span-2">
                    <div className="grid gap-4 md:grid-cols-[1fr_320px]">
                        <ProfileView data={viewData} />
                        <aside className="space-y-4">
                            <PreviewCard data={viewData} />
                            <MetricsCard />
                        </aside>
                    </div>
                </TabsContent>


                <TabsContent value="edit" className="md:col-span-2">
                    <div className="grid gap-4 md:grid-cols-[1fr_320px]">
                        <ProfileEditForm initialData={viewData} onSaved={handleSaved} />
                        <aside className="space-y-4">
                            <PreviewCard data={viewData} />
                            <MetricsCard />
                        </aside>
                    </div>
                </TabsContent>
            </div>
        </Tabs>
    );
}


function PreviewCard({ data }: { data: PerfilCandidatoFormValues }) {
    return (
        <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-emerald-200" />
                <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{data.nombre} {data.apellido}</p>
                    <p className="truncate text-sm text-slate-500">{data.tituloProfesional || "Perfil profesional"}</p>
                </div>
            </div>
            <p className="mt-3 text-sm text-slate-600 line-clamp-4">{data.resumen}</p>
        </div>
    );
}

function MetricsCard() {
    const fetcher = (url: string) => axios.get(url).then(r => r.data as {
        aplicadas: number;
        guardadas: number;
        entrevistas: number;
        evaluaciones: number;
        contratacion: number;
        rechazada: number;
    });

    const { data, isLoading, error } = useSWR("/api/candidatos/metrics", fetcher, {
        revalidateOnFocus: false,
    });

    const metrics = [
        { label: "Guardadas", value: data?.guardadas ?? 0 },
        { label: "Aplicadas", value: data?.aplicadas ?? 0 },
        { label: "Entrevistas", value: data?.entrevistas ?? 0 },
        { label: "Evaluaciones", value: data?.evaluaciones ?? 0 },
        { label: "Contrataciones", value: data?.contratacion ?? 0 },
        { label: "Rechazadas", value: data?.rechazada ?? 0 },
    ];

    return (
        <div className="rounded-xl border bg-white p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Métricas</h3>

            {isLoading ? (
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-lg border bg-slate-50 p-3">
                            <div className="h-5 w-10 animate-pulse rounded bg-slate-200" />
                            <div className="mt-1 h-4 w-24 animate-pulse rounded bg-slate-200" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <p className="text-xs text-red-600">No se pudieron cargar las métricas.</p>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {metrics.map((m) => (
                        <div key={m.label} className="rounded-lg border bg-slate-50 p-3 text-center">
                            <p className="text-lg font-semibold text-slate-900">{m.value}</p>
                            <p className="text-xs text-slate-500">{m.label}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}