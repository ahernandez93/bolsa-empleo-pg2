"use client";

import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin, User, Briefcase, GraduationCap, BadgeCheck } from "lucide-react";
import type { PerfilCandidatoFormValues } from "@/lib/schemas/perfilCandidatoSchema";

export default function ProfileView({ data }: { data: PerfilCandidatoFormValues }) {
    return (
        <section className="space-y-4">
            <Card className="rounded-xl border bg-white p-4">
                <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-emerald-200" />
                    <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-slate-900">{data.firstName} {data.lastName}</h2>
                        <p className="text-sm text-slate-500">{data.headline}</p>
                    </div>
                </div>
            </Card>


            {/* Datos personales */}
            <Section title="Datos personales" icon={<User className="h-4 w-4" />}>
                <Row icon={<Mail className="h-4 w-4" />} label="Correo" value={data.email} />
                {data.phone && <Row icon={<Phone className="h-4 w-4" />} label="Teléfono" value={data.phone} />}
                {data.location && <Row icon={<MapPin className="h-4 w-4" />} label="Ubicación" value={data.location} />}
            </Section>


            {/* Resumen */}
            {data.summary && (
                <Section title="Resumen profesional" icon={<BadgeCheck className="h-4 w-4" />}>
                    <p className="text-sm text-slate-700">{data.summary}</p>
                </Section>
            )}


            {/* Experiencia */}
            <Section title="Experiencia laboral" icon={<Briefcase className="h-4 w-4" />}>
                {data.experience.map((exp, i) => (
                    <div key={i} className="rounded-lg border p-3">
                        <p className="text-sm font-medium text-slate-900">{exp.company} — {exp.role}</p>
                        <p className="text-xs text-slate-500">{exp.startDate} — {exp.endDate || "Actual"}</p>
                        {exp.description && <p className="mt-1 text-sm text-slate-700">{exp.description}</p>}
                    </div>
                ))}
            </Section>


            {/* Educación */}
            <Section title="Formación académica" icon={<GraduationCap className="h-4 w-4" />}>
                {data.education.map((ed, i) => (
                    <div key={i} className="rounded-lg border p-3">
                        <p className="text-sm font-medium text-slate-900">{ed.institution} — {ed.degree}</p>
                        <p className="text-xs text-slate-500">{ed.graduationYear || ""} {ed.location ? `• ${ed.location}` : ""}</p>
                    </div>
                ))}
            </Section>


            {/* Habilidades */}
            {data.skills.length > 0 && (
                <Section title="Habilidades" icon={<BadgeCheck className="h-4 w-4" />}>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.map((s) => (
                            <span key={s} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">{s}</span>
                        ))}
                    </div>
                </Section>
            )}
        </section>
    );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
    return (
        <Card className="space-y-3 rounded-xl border bg-white p-4">
            <div className="flex items-center gap-2 text-slate-700"><span>{icon}</span><h3 className="text-sm font-semibold">{title}</h3></div>
            <div className="space-y-2">{children}</div>
        </Card>
    );
}

function Row({ icon, label, value }: { icon?: React.ReactNode; label: string; value?: string }) {
    if (!value) return null;
    return (
        <div className="flex items-center justify-between rounded-lg border p-2">
            <div className="flex items-center gap-2 text-sm text-slate-600"><span>{icon}</span>{label}</div>
            <div className="truncate text-sm font-medium text-slate-800">{value}</div>
        </div>
    );
}
