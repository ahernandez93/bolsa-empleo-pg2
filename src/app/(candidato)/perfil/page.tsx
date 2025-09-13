"use client";

import ProfileTabs from "@/components/perfilcandidatos/ProfileTabs";
import { mapPerfilToFormValues } from "@/lib/mappers/perfilCandidato";
import type { PerfilCandidatoFormValues } from "@/lib/schemas/perfilCandidatoSchema";
import axios from "axios";
import { useEffect, useState } from "react";

// Simulación de datos actuales del candidato (reemplazá por fetch a tu API/Prisma)
/* const mockProfile: PerfilCandidatoFormValues = {
    avatarUrl: "",
    firstName: "Juan",
    lastName: "Perez",
    headline: "Desarrollador Full‑Stack",
    email: "juan.perez@mail.com",
    phone: "+504 12345678",
    location: "San Pedro Sula, Cortes, Honduras",
    summary:
        "Ingeniero de software con 6+ años creando productos web escalables y centrados en el usuario. Experto en React, Node.js y diseño de experiencias.",
    experience: [
        {
            company: "TechCom",
            role: "Senior Full‑Stack Dev",
            startDate: "2022",
            endDate: "Presente",
            description: "Lidero el desarrollo de módulos críticos con Next.js y NestJS.",
        },
        {
            company: "SoftLabs",
            role: "Frontend Dev",
            startDate: "2019",
            endDate: "2022",
            description: "Implementación de UI con React y mejora de performance.",
        },
    ],
    education: [
        {
            institution: "CEUTEC",
            degree: "Ing. en Informática",
            graduationYear: "2019",
            location: "San Pedro Sula, Cortes, Honduras",
        },
    ],
    skills: ["React", "Node.js", "SQL", "Comunicación"],
}; */

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

    return (
        <div className="min-h-screen bg-slate-50">
            <main className="mx-auto grid max-w-6xl gap-4 px-4 py-6 md:grid-cols-[1fr_320px]">
                <ProfileTabs initialData={data} />
            </main>
        </div>
    );

}