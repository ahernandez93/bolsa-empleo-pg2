"use client";


import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { perfilCandidatoSchema, type PerfilCandidatoFormValues } from "@/lib/schemas/perfilCandidatoSchema";


import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Upload } from "lucide-react";


export default function ProfileEditForm({ initialData }: { initialData: PerfilCandidatoFormValues }) {
    const form = useForm<PerfilCandidatoFormValues>({ resolver: zodResolver(perfilCandidatoSchema), defaultValues: initialData });


    const expArray = useFieldArray({ control: form.control, name: "experience" });
    const eduArray = useFieldArray({ control: form.control, name: "education" });


    const [saving, setSaving] = useState(false);


    const onSubmit = async (values: PerfilCandidatoFormValues) => {
        setSaving(true);
        try {
            // Reemplaza por tu llamada real a la API
            await new Promise((r) => setTimeout(r, 900));
            console.log("PROFILE UPDATE →", values);
            // Aquí podrías disparar un toast de éxito
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="space-y-4">
            {/* Avatar */}
            <Card className="rounded-xl border bg-white p-4">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-20 w-20 rounded-full bg-emerald-200" />
                    <Button variant="secondary" size="sm" className="gap-2"><Upload className="h-4 w-4" /> Cambiar foto</Button>
                </div>
            </Card>
            {/* Datos personales */}
            <Card className="space-y-3 rounded-xl border bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-700">Datos personales</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Nombre" {...form.register("firstName")} />
                    <Field label="Apellido" {...form.register("lastName")} />
                    <Field label="Correo" type="email" {...form.register("email")} />
                    <Field label="Teléfono" {...form.register("phone")} />
                    <Field label="Ubicación" className="md:col-span-2" {...form.register("location")} />
                    <Field label="Título profesional (headline)" className="md:col-span-2" {...form.register("headline")} />
                </div>
            </Card>
            {/* Resumen */}
            <Card className="space-y-3 rounded-xl border bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-700">Resumen profesional</h3>
                <Label htmlFor="summary" className="sr-only">Resumen</Label>
                <Textarea id="summary" rows={4} placeholder="Breve introducción (máx. 600)" {...form.register("summary")} />
            </Card>
            {/* Experiencia laboral */}
            <Card className="space-y-3 rounded-xl border bg-white p-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-700">Experiencia laboral</h3>
                    <Button variant="secondary" size="sm" onClick={() => expArray.append({ company: "", role: "", startDate: "", endDate: "", description: "" })}><Plus className="h-4 w-4" /> Agregar</Button>
                </div>
                <div className="space-y-4">
                    {expArray.fields.map((field, index) => (
                        <div key={field.id} className="rounded-lg border p-3">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-sm font-medium text-slate-800">Experiencia {index + 1}</p>
                                <Button variant="destructive" size="sm" onClick={() => expArray.remove(index)} className="gap-1"><Trash2 className="h-4 w-4" /> Eliminar</Button>
                            </div>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <Field label="Empresa" {...form.register(`experience.${index}.company` as const)} />
                                <Field label="Puesto" {...form.register(`experience.${index}.role` as const)} />
                                <Field label="Fecha inicio" {...form.register(`experience.${index}.startDate` as const)} />
                                <Field label="Fecha fin" {...form.register(`experience.${index}.endDate` as const)} />
                                <div className="md:col-span-2">
                                    <Label className="mb-1 block text-sm">Descripción breve</Label>
                                    <Textarea rows={3} {...form.register(`experience.${index}.description` as const)} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
            {/* Formación académica */}
            <Card className="space-y-3 rounded-xl border bg-white p-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-700">Formación académica</h3>
                    <Button variant="secondary" size="sm" onClick={() => eduArray.append({ institution: "", degree: "", graduationYear: "", location: "" })}><Plus className="h-4 w-4" /> Agregar</Button>
                </div>
                <div className="space-y-4">
                    {eduArray.fields.map((field, index) => (
                        <div key={field.id} className="rounded-lg border p-3">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-sm font-medium text-slate-800">Educación {index + 1}</p>
                                <Button variant="destructive" size="sm" onClick={() => eduArray.remove(index)} className="gap-1"><Trash2 className="h-4 w-4" /> Eliminar</Button>
                            </div>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <Field label="Institución" {...form.register(`education.${index}.institution` as const)} />
                                <Field label="Título" {...form.register(`education.${index}.degree` as const)} />
                                <Field label="Año de graduación" {...form.register(`education.${index}.graduationYear` as const)} />
                                <Field label="Ubicación" {...form.register(`education.${index}.location` as const)} />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
            {/* Habilidades */}
            <Card className="space-y-3 rounded-xl border bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-700">Habilidades</h3>
                <SkillsController form={form} />
            </Card>


            {/* Acciones */}
            <div className="flex items-center justify-end gap-3">
                <Button variant="outline">Cancelar</Button>
                <Button onClick={form.handleSubmit(onSubmit)} disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</Button>
            </div>
        </section>
    );
}

function Field({ label, className, ...rest }: React.ComponentProps<typeof Input> & { label: string }) {
    return (
        <div className={className}>
            <Label className="mb-1 block text-sm">{label}</Label>
            <Input {...rest} />
        </div>
    );
}


function SkillsController({ form }: { form: any }) {
    const skills: string[] = form.watch("skills") || [];
    const [value, setValue] = useState("");


    const addSkill = () => {
        const v = value.trim();
        if (!v) return;
        form.setValue("skills", Array.from(new Set([...(skills || []), v])));
        setValue("");
    };
    const removeSkill = (s: string) => {
        form.setValue(
            "skills",
            (skills || []).filter((x) => x !== s)
        );
    };


    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Input placeholder="Añadir habilidad y presiona Enter" value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} />
                <Button type="button" variant="secondary" onClick={addSkill}>Agregar</Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {(skills || []).map((s: string) => (
                    <span key={s} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">
                        {s}
                        <button type="button" className="rounded-full bg-emerald-200/60 px-1 text-[10px]" onClick={() => removeSkill(s)}>×</button>
                    </span>
                ))}
            </div>
        </div>
    );
}