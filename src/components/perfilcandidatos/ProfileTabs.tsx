"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileView from "@/components/perfilcandidatos/ProfileView";
import ProfileEditForm from "@/components/perfilcandidatos/ProfileEditForm";
import type { PerfilCandidatoFormValues } from "@/lib/schemas/perfilCandidatoSchema";

export default function ProfileTabs({ initialData }: { initialData: PerfilCandidatoFormValues }) {
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
                        <ProfileView data={initialData} />
                        <aside className="space-y-4">
                            <PreviewCard data={initialData} />
                            <MetricsCard />
                        </aside>
                    </div>
                </TabsContent>


                <TabsContent value="edit" className="md:col-span-2">
                    <div className="grid gap-4 md:grid-cols-[1fr_320px]">
                        <ProfileEditForm initialData={initialData} />
                        <aside className="space-y-4">
                            <PreviewCard data={initialData} />
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
    // Puedes traer esto de tu API (postulaciones/guardados/entrevistas)
    const metrics = [
        { label: "Aplicadas", value: 12 },
        { label: "Guardadas", value: 7 },
        { label: "Entrevistas", value: 3 },
        { label: "Ofertas", value: 1 },
    ];
    return (
        <div className="rounded-xl border bg-white p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Métricas</h3>
            <div className="grid grid-cols-2 gap-3">
                {metrics.map((m) => (
                    <div key={m.label} className="rounded-lg border bg-slate-50 p-3 text-center">
                        <p className="text-lg font-semibold text-slate-900">{m.value}</p>
                        <p className="text-xs text-slate-500">{m.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}