"use client";

import ProfileTabs from "@/components/perfilcandidatos/ProfileTabs";
import { mapPerfilToFormValues } from "@/lib/mappers/perfilCandidato";
import type { PerfilCandidatoFormValues } from "@/lib/schemas/perfilCandidatoSchema";
import axios from "axios";
import { useEffect, useState } from "react";

export default function ProfilePage() {
    const [data, setData] = useState<PerfilCandidatoFormValues | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        axios.get("/api/candidatos/perfil")
            .then((res) => {
                if (!mounted) return;
                const mapped = mapPerfilToFormValues(res.data);
                setData(mapped);
            })
            .catch((e) => {
                if (!mounted) return;
                setErr(e?.response?.data?.message ?? "No se pudo cargar el perfil");
            })
            .finally(() => mounted && setLoading(false));

        return () => { mounted = false; };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen grid place-items-center">
                <p className="text-muted-foreground">Cargando perfil…</p>
            </div>
        );
    }

    if (err || !data) {
        return (
            <div className="min-h-screen grid place-items-center">
                <p className="text-red-500">{err ?? "Perfil no disponible"}</p>
            </div>
        );
    }

    const handleSaved = (updated: PerfilCandidatoFormValues) => {
        setData(updated);
    };


    return (
        <div className="min-h-screen bg-slate-50">
            <main className="mx-auto grid max-w-6xl gap-4 px-4 py-6 md:grid-cols-[1fr_320px]">
                <ProfileTabs initialData={data} onSaved={handleSaved} />
            </main>
        </div>
    );

}