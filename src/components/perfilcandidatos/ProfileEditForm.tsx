"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller, type SubmitHandler, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { perfilCandidatoSchema } from "@/lib/schemas/perfilCandidatoSchema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Upload } from "lucide-react";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import useSWR from "swr";


// Tipos de entrada/salida para alinear con zodResolver
type FormInput = z.input<typeof perfilCandidatoSchema>;
type FormOutput = z.output<typeof perfilCandidatoSchema>;
type Props = { initialData: Partial<FormInput> };

const fetcher = (url: string) => axios.get(url).then((r) => r.data);

export default function ProfileEditForm({ initialData }: Props) {
    // Normalizamos initialData con el schema (rellena arrays vacíos, etc.)
    const defaultValues: FormInput = perfilCandidatoSchema.parse({
        nombre: "",
        apellido: "",
        email: "",
        // lo que venga del servidor pisa lo de arriba
        ...initialData,
    });

    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm<FormInput, any, FormOutput>({
        resolver: zodResolver(perfilCandidatoSchema),
        defaultValues,
        mode: "onChange",
    });

    // Si cambia initialData desde fuera (ej. SWR), reseteamos de forma segura
    useEffect(() => {
        form.reset(perfilCandidatoSchema.parse({ ...defaultValues }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData]);

    const expArray = useFieldArray({ control: form.control, name: "experiencia" });
    const eduArray = useFieldArray({ control: form.control, name: "educacion" });

    const [saving, setSaving] = useState(false);

    // Departamentos
    const { data: departamentos, isLoading: loadingDeptos } = useSWR<{ id: number; nombre: string }[]>(
        "/api/ubicaciones/departamentos",
        fetcher
    );

    // Ciudades dependientes del departamento seleccionado
    const deptoId = form.watch("ubicacionDepartamentoId");
    const { data: ciudades, isLoading: loadingCiudades } = useSWR<{ id: number; nombre: string }[]>(
        typeof deptoId === "number" ? `/api/ubicaciones/ciudades?departamentoId=${deptoId}` : null,
        fetcher
    );
    const onSubmit: SubmitHandler<FormOutput> = async (values) => {
        setSaving(true);
        try {
            await axios.put(`/api/candidatos/perfil/`, values);

            console.log("PROFILE UPDATE →", values);
            toast.success("Perfil actualizado");
        } catch (err) {
            console.error("Error al actualizar perfil:", err);
            toast.error("Error al actualizar perfil");
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
                    <Button variant="secondary" size="sm" className="gap-2">
                        <Upload className="h-4 w-4" /> Cambiar foto
                    </Button>
                </div>
            </Card>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Datos personales */}
                <Card className="space-y-3 rounded-xl border bg-white p-4">
                    <h3 className="text-sm font-semibold text-slate-700">Datos personales</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Nombre" {...form.register("nombre")} />
                        <Field label="Apellido" {...form.register("apellido")} />
                        <Field label="Correo" type="email" {...form.register("email")} />
                        <Field label="Teléfono" {...form.register("telefono")} />

                        {/* IDs numéricos, usa Controller para convertir a number */}
                        <div className="md:col-span-1">
                            <Label className="mb-1 block text-sm">Departamento</Label>
                            <Controller
                                name="ubicacionDepartamentoId"
                                control={form.control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value?.toString() ?? ""}
                                        onValueChange={(v) => {
                                            field.onChange(Number(v));
                                            // reset ciudad sin pelear con TS (asumiendo FormBase permite undefined)
                                            form.setValue("ubicacionCiudadId", undefined as unknown as number, {
                                                shouldValidate: true,
                                                shouldDirty: true,
                                            });
                                        }}
                                        disabled={loadingDeptos}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={loadingDeptos ? "Cargando..." : "Seleccione un departamento"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(departamentos ?? []).map((d) => (
                                                <SelectItem key={d.id} value={d.id.toString()}>
                                                    {d.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        {/* <div className="md:col-span-1">
                            <Controller
                                name="ubicacionDepartamentoId"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Departamento</FormLabel>
                                        <Select
                                            value={field.value?.toString() ?? ""}
                                            onValueChange={(v) => {
                                                field.onChange(Number(v));
                                                // reset ciudad sin pelear con TS (asumiendo FormBase permite undefined)
                                                form.setValue("ubicacionCiudadId", undefined as unknown as number, {
                                                    shouldValidate: true,
                                                    shouldDirty: true,
                                                });
                                            }}
                                            disabled={loadingDeptos}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={loadingDeptos ? "Cargando..." : "Seleccione un departamento"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(departamentos ?? []).map((d) => (
                                                    <SelectItem key={d.id} value={d.id.toString()}>
                                                        {d.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div> */}

                        <div className="md:col-span-1">
                            <Label className="mb-1 block text-sm">Ciudad</Label>
                            <Controller
                                name="ubicacionCiudadId"
                                control={form.control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value?.toString() ?? ""}
                                        onValueChange={(v) => field.onChange(Number(v))}
                                        disabled={loadingCiudades}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={loadingCiudades ? "Cargando..." : "Seleccione una ciudad"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(ciudades ?? []).map((c) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>
                                                    {c.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        {/* <div className="min-w-0">
                            {form.watch("ubicacionDepartamentoId") ? (
                                <Controller
                                    name="ubicacionCiudadId"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Ciudad</FormLabel>
                                            <Select
                                                value={field.value?.toString() ?? ""}
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                disabled={loadingCiudades}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder={loadingCiudades ? "Cargando..." : "Seleccione una ciudad"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(ciudades ?? []).map((c) => (
                                                        <SelectItem key={c.id} value={c.id.toString()}>
                                                            {c.nombre}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ) : (
                                <FormItem className="w-full">
                                    <FormLabel>Ciudad</FormLabel>
                                    <Select disabled>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccione primero un departamento" />
                                        </SelectTrigger>
                                    </Select>
                                </FormItem>
                            )}
                        </div> */}

                        <Field
                            label="Título profesional (headline)"
                            className="md:col-span-2"
                            {...form.register("tituloProfesional")}
                        />
                    </div>
                </Card>

                {/* Resumen */}
                <Card className="space-y-3 rounded-xl border bg-white p-4">
                    <h3 className="text-sm font-semibold text-slate-700">Resumen profesional</h3>
                    <Label htmlFor="summary" className="sr-only">
                        Resumen
                    </Label>
                    <Textarea
                        id="summary"
                        rows={4}
                        placeholder="Breve introducción (máx. 600)"
                        {...form.register("resumen")}
                    />
                </Card>

                {/* Experiencia laboral */}
                <Card className="space-y-3 rounded-xl border bg-white p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-700">Experiencia laboral</h3>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                                expArray.append({
                                    empresa: "",
                                    puesto: "",
                                    fechaInicio: "",
                                    fechaFin: "",
                                    descripcion: "",
                                })
                            }
                        >
                            <Plus className="h-4 w-4" /> Agregar
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {expArray.fields.map((field, index) => (
                            <div key={field.id} className="rounded-lg border p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <p className="text-sm font-medium text-slate-800">Experiencia {index + 1}</p>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => expArray.remove(index)}
                                        className="gap-1"
                                    >
                                        <Trash2 className="h-4 w-4" /> Eliminar
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <Field
                                        label="Empresa"
                                        {...form.register(`experiencia.${index}.empresa` as const)}
                                    />
                                    <Field
                                        label="Puesto"
                                        {...form.register(`experiencia.${index}.puesto` as const)}
                                    />
                                    <Field
                                        label="Fecha inicio"
                                        {...form.register(`experiencia.${index}.fechaInicio` as const)}
                                    />
                                    <Field
                                        label="Fecha fin"
                                        {...form.register(`experiencia.${index}.fechaFin` as const)}
                                    />
                                    <div className="md:col-span-2">
                                        <Label className="mb-1 block text-sm">Descripción breve</Label>
                                        <Textarea
                                            rows={3}
                                            {...form.register(`experiencia.${index}.descripcion` as const)}
                                        />
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
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                                eduArray.append({
                                    institucion: "",
                                    titulo: "",
                                    fechaInicio: "",
                                    fechaFin: "",
                                })
                            }
                        >
                            <Plus className="h-4 w-4" /> Agregar
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {eduArray.fields.map((field, index) => (
                            <div key={field.id} className="rounded-lg border p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <p className="text-sm font-medium text-slate-800">Educación {index + 1}</p>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => eduArray.remove(index)}
                                        className="gap-1"
                                    >
                                        <Trash2 className="h-4 w-4" /> Eliminar
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <Field
                                        label="Institución"
                                        {...form.register(`educacion.${index}.institucion` as const)}
                                    />
                                    <Field
                                        label="Título"
                                        {...form.register(`educacion.${index}.titulo` as const)}
                                    />
                                    <Field
                                        label="Fecha inicio"
                                        {...form.register(`educacion.${index}.fechaInicio` as const)}
                                    />
                                    <Field
                                        label="Fecha fin"
                                        {...form.register(`educacion.${index}.fechaFin` as const)}
                                    />
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
                    <Button type="button" variant="outline">
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? "Guardando..." : "Guardar cambios"}
                    </Button>
                </div>
            </form>
        </section>
    );
}

function Field(
    { label, className, ...rest }: React.ComponentProps<typeof Input> & { label: string }
) {
    return (
        <div className={className}>
            <Label className="mb-1 block text-sm">{label}</Label>
            <Input {...rest} />
        </div>
    );
}

// Control de skills con dirty/validate para que RHF actualice bien el estado
//eslint-disable-next-line @typescript-eslint/no-explicit-any
function SkillsController({ form }: { form: UseFormReturn<FormInput, any, FormOutput> }) {
    const skills = form.watch("habilidades") || [];
    const [value, setValue] = useState("");

    const addSkill = () => {
        const v = value.trim();
        if (!v) return;
        const next = Array.from(new Set([...(skills || []), v]));
        form.setValue("habilidades", next, { shouldDirty: true, shouldValidate: true });
        setValue("");
    };

    const removeSkill = (s: string) => {
        const next = (skills || []).filter((x: string) => x !== s);
        form.setValue("habilidades", next, { shouldDirty: true, shouldValidate: true });
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Input
                    placeholder="Añadir habilidad y presiona Enter"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addSkill();
                        }
                    }}
                />
                <Button type="button" variant="secondary" onClick={addSkill}>
                    Agregar
                </Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {(skills || []).map((s: string) => (
                    <span
                        key={s}
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700"
                    >
                        {s}
                        <button
                            type="button"
                            className="rounded-full bg-emerald-200/60 px-1 text-[10px]"
                            onClick={() => removeSkill(s)}
                        >
                            ×
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
}
