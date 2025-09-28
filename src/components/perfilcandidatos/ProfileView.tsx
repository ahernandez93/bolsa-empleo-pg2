"use client";

import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin, User, Briefcase, GraduationCap, BadgeCheck, IdCard, CheckCircle2, Plane, Home, Car, FileText } from "lucide-react";
import type { PerfilCandidatoFormValues } from "@/lib/schemas/perfilCandidatoSchema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";


export default function ProfileView({ data }: { data: PerfilCandidatoFormValues }) {
    return (
        <section className="space-y-4">
            <Card className="rounded-xl border bg-white p-4">
                <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                        {/* Si algún día guardas foto: <AvatarImage src={data.avatarUrl} alt={`${data.nombre} ${data.apellido}`} /> */}
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
                            {getInitials(data.nombre, data.apellido)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-slate-900">{data.nombre} {data.apellido}</h2>
                        {data.tituloProfesional ? (
                            <p className="text-sm text-slate-500">{data.tituloProfesional}</p>
                        ) : null}
                    </div>
                </div>
            </Card>


            {/* Datos personales */}
            <Section title="Datos personales" icon={<User className="h-4 w-4" />}>
                <Row icon={<Mail className="h-4 w-4" />} label="Correo" value={data.email} />
                {data.telefono && <Row icon={<Phone className="h-4 w-4" />} label="Teléfono" value={data.telefono} />}
                {data.direccion && <Row icon={<IdCard className="h-4 w-4" />} label="Dirección" value={data.direccion} />}
                {data.fechaNacimiento && (
                    <Row icon={<IdCard className="h-4 w-4" />} label="Fecha de nacimiento" value={(data.fechaNacimiento ?? "").slice(0, 10)} />
                )}
                {data.genero && <Row icon={<IdCard className="h-4 w-4" />} label="Género" value={data.genero} />}
                {data.ubicacionCiudadId && <Row icon={<MapPin className="h-4 w-4" />} label="Ubicación" value={[data.ubicacionCiudad, data.ubicacionDepartamento].filter(Boolean).join(", ")} />}
            </Section>


            {/* Resumen */}
            {data.resumen && (
                <Section title="Resumen profesional" icon={<BadgeCheck className="h-4 w-4" />}>
                    <p className="text-sm text-slate-700">{data.resumen}</p>
                </Section>
            )}

            {/* Perfil profesional (disponibilidad y flags) */}
            {(data.disponibilidad || data.disponibilidadViajar || data.cambioResidencia || data.poseeVehiculo || data.cvUrl) && (
                <Section title="Perfil profesional" icon={<BadgeCheck className="h-4 w-4" />}>
                    {data.disponibilidad && (
                        <Row icon={<CheckCircle2 className="h-4 w-4" />} label="Disponibilidad" value={data.disponibilidad} />
                    )}
                    <FlagRow icon={<Plane className="h-4 w-4" />} label="Disponible para viajar" flag={!!data.disponibilidadViajar} />
                    <FlagRow icon={<Home className="h-4 w-4" />} label="Cambio de residencia" flag={!!data.cambioResidencia} />
                    <FlagRow icon={<Car className="h-4 w-4" />} label="Posee vehículo" flag={!!data.poseeVehiculo} />
                    {data.cvUrl && (
                        <Row
                            icon={<FileText className="h-4 w-4" />}
                            label="Currículum"
                            value={<a className="underline inline-block max-w-[220px] truncate align-middle" href={data.cvUrl} target="_blank" rel="noopener noreferrer" title={data.cvUrl}
                            >Ver CV</a>}
                        />
                    )}
                </Section>
            )}

            {/* Experiencia */}
            <Section title="Experiencia laboral" icon={<Briefcase className="h-4 w-4" />}>
                {data.experiencia.map((exp, i) => (
                    <div key={i} className="rounded-lg border p-3">
                        <p className="text-sm font-medium text-slate-900">{exp.empresa} — {exp.puesto}</p>
                        <p className="text-xs text-slate-500">{exp.fechaInicio} — {exp.fechaFin || "Actual"}</p>
                        {exp.descripcion && <p className="mt-1 text-sm text-slate-700">{exp.descripcion}</p>}
                    </div>
                ))}
                {data.experiencia.length === 0 && <Empty text="Aún no registra experiencia." />}
            </Section>


            {/* Educación */}
            <Section title="Formación académica" icon={<GraduationCap className="h-4 w-4" />}>
                {data.educacion.map((ed, i) => (
                    <div key={i} className="rounded-lg border p-3">
                        <p className="text-sm font-medium text-slate-900">{ed.institucion} — {ed.titulo}</p>
                        <p className="text-xs text-slate-500">{ed.fechaFin || ""} {/* {ed.location ? `• ${ed.location}` : ""} */}</p>
                    </div>
                ))}
                {data.educacion.length === 0 && <Empty text="Aún no registra formación." />}
            </Section>


            {/* Habilidades */}
            {data.habilidades.length > 0 && (
                <Section title="Habilidades" icon={<BadgeCheck className="h-4 w-4" />}>
                    <div className="flex flex-wrap gap-2">
                        {data.habilidades.map((s) => (
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

function Row({ icon, label, value }: { icon?: React.ReactNode; label: string; value?: React.ReactNode; }) {
    if (!value) return null;
    return (
        <div className="flex items-center justify-between rounded-lg border p-2">
            <div className="flex items-center gap-2 text-sm text-slate-600"><span>{icon}</span>{label}</div>
            <div className="truncate text-sm font-medium text-slate-800">{value}</div>
        </div>
    );
}

function FlagRow({ icon, label, flag }: { icon?: React.ReactNode; label: string; flag: boolean }) {
    return (
        <div className="flex items-center justify-between rounded-lg border p-2">
            <div className="flex items-center gap-2 text-sm text-slate-600"><span>{icon}</span>{label}</div>
            <div className={`text-xs ${flag ? "text-emerald-700" : "text-slate-500"}`}>{flag ? "Sí" : "No"}</div>
        </div>
    );
}

function Empty({ text }: { text: string }) {
    return <p className="text-sm text-slate-500">{text}</p>;
}

function getInitials(nombre?: string, apellido?: string) {
    const n = (nombre ?? "").trim().split(" ")[0] || "";
    const a = (apellido ?? "").trim().split(" ")[0] || "";
    const ni = n.charAt(0).toUpperCase();
    const ai = a.charAt(0).toUpperCase();
    return (ni + ai) || "U"; // U de Usuario :)
}
