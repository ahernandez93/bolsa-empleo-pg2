"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray, Controller, type SubmitHandler, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { perfilCandidatoSchema } from "@/lib/schemas/perfilCandidatoSchema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Upload, FileText, X } from "lucide-react";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import useSWR from "swr";
import type { PerfilCandidatoFormValues } from "@/lib/schemas/perfilCandidatoSchema";
import { mapPerfilToFormValues } from "@/lib/mappers/perfilCandidato";

type FormInput = z.input<typeof perfilCandidatoSchema>;
type FormOutput = z.output<typeof perfilCandidatoSchema>;
type Props = {
    initialData: Partial<FormInput>;
    onSaved?: (updated: FormOutput) => void;
};

const fetcher = (url: string) => axios.get(url).then((r) => r.data);
const fetcherProfile = (url: string) =>
    axios.get(url).then((r) => mapPerfilToFormValues(r.data));

const DISPONIBILIDADES = ["INMEDIATA", "1 SEMANA", "2 SEMANAS", "1 MES", "MAYOR A 1 MES"] as const;
const GENEROS = ["MASCULINO", "FEMENINO", "OTRO"] as const;

export default function ProfileEditForm({ initialData, onSaved }: Props) {
    // Normaliza defaults
    const defaultValues: FormInput = perfilCandidatoSchema.parse({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        direccion: "",
        fechaNacimiento: "",
        genero: undefined,
        ubicacionDepartamentoId: undefined,
        ubicacionCiudadId: undefined,
        tituloProfesional: "",
        resumen: "",
        disponibilidad: undefined,
        disponibilidadViajar: false,
        cambioResidencia: false,
        poseeVehiculo: false,
        cvUrl: undefined,
        cvMimeType: undefined,
        cvSize: undefined,
        experiencia: [],
        educacion: [],
        habilidades: [],
        ...initialData,
    });

    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm<FormInput, any, FormOutput>({
        resolver: zodResolver(perfilCandidatoSchema),
        defaultValues,
        mode: "onChange",
    });

    const { data, isLoading } = useSWR<PerfilCandidatoFormValues>(
        "/api/candidatos/perfil",
        fetcherProfile,
        { revalidateOnFocus: false }
    );

    useEffect(() => {
        if (data) form.reset(data);
    }, [data, form]);

    const expArray = useFieldArray({ control: form.control, name: "experiencia" });
    const eduArray = useFieldArray({ control: form.control, name: "educacion" });

    const [saving, setSaving] = useState(false);
    const [uploadingCv, setUploadingCv] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Ubicaciones
    const { data: departamentos, isLoading: loadingDeptos } = useSWR<{ id: number; nombre: string }[]>(
        "/api/ubicaciones/departamentos",
        fetcher
    );
    const deptoId = form.watch("ubicacionDepartamentoId");
    const { data: ciudades, isLoading: loadingCiudades } = useSWR<{ id: number; nombre: string }[]>(
        typeof deptoId === "number" ? `/api/ubicaciones/ciudades?departamentoId=${deptoId}` : null,
        fetcher
    );

    // Submit
    const onSubmit: SubmitHandler<FormOutput> = async (values) => {
        setSaving(true);
        try {
            console.log("PUT → /api/candidatos/perfil", values);
            const res = await axios.put(`/api/candidatos/perfil`, values);
            const mapped = mapPerfilToFormValues(res.data);
            onSaved?.(mapped);
            toast.success("Perfil actualizado");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Error al actualizar perfil:", err?.response?.data ?? err);
            toast.error(err?.response?.data?.message ?? "Error al actualizar perfil");
        } finally {
            setSaving(false);
        }
    };

    // CV: upload/remove (PDF)
    const handleSelectCv = async (file?: File) => {
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("Solo se admite PDF.");
            return;
        }
        if (file.size > 8 * 1024 * 1024) {
            toast.error("El archivo excede 8MB.");
            return;
        }
        const oldUrl = form.getValues("cvUrl");

        setUploadingCv(true);
        const fd = new FormData();
        fd.append("file", file);

        try {
            const { data } = await axios.post("/api/candidatos/cv", fd);
            const nextUrl = data.url as string;
            const nextMime = (data.mime as string) ?? "application/pdf";
            const nextSize = (data.size as number) ?? file.size;
            await axios.put("/api/candidatos/perfil", {
                cvUrl: nextUrl,
                cvMimeType: nextMime,
                cvSize: nextSize,
            });
            form.setValue("cvUrl", nextUrl, { shouldDirty: true, shouldValidate: true });
            form.setValue("cvMimeType", nextMime, { shouldDirty: true });
            form.setValue("cvSize", nextSize, { shouldDirty: true });

            toast.success("CV subido");
            if (oldUrl && oldUrl !== nextUrl) {
                axios
                    .delete("/api/candidatos/cv", { params: { url: oldUrl } })
                    .catch(() => { /* lo ignoramos para no romper la UX */ });
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            console.error("Upload CV error →", e?.response?.data ?? e);
            toast.error(e?.response?.data?.message ?? "No se pudo subir el CV");
        } finally {
            setUploadingCv(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemoveCv = async () => {
        const url = form.getValues("cvUrl");

        try {
            if (url) {
                await axios.delete(`/api/candidatos/cv`, { params: { url } });
            }
            // Limpia UI del form (el servidor ya limpió BD)
            form.setValue("cvUrl", undefined, { shouldDirty: true, shouldValidate: true });
            form.setValue("cvMimeType", undefined, { shouldDirty: true });
            form.setValue("cvSize", undefined, { shouldDirty: true });
            toast.success("CV eliminado");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            console.error("Eliminar CV →", e?.response?.data ?? e);
            toast.error(e?.response?.data?.message ?? "No se pudo eliminar el CV");
        }
    };

    return isLoading ? (
        <div className="p-4">Cargando perfil…</div>
    ) : (
        <section className="space-y-4">
            {/* Avatar + CV */}
            <Card className="rounded-xl border bg-white p-4">
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-20 w-20 rounded-full bg-emerald-200" />
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900">
                                {form.watch("nombre")} {form.watch("apellido")}
                            </p>
                            {form.watch("tituloProfesional") && (
                                <p className="text-xs text-slate-500">{form.watch("tituloProfesional")}</p>
                            )}
                        </div>
                    </div>

                    {/* CV */}
                    <div className="flex items-center gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf"
                            hidden
                            onChange={(e) => handleSelectCv(e.target.files?.[0])}
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="gap-2"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingCv}
                        >
                            <Upload className="h-4 w-4" />
                            {uploadingCv ? "Subiendo..." : "Subir CV (PDF)"}
                        </Button>

                        {form.watch("cvUrl") && (
                            <>
                                <a
                                    className="inline-flex items-center gap-1 text-sm underline"
                                    href={form.watch("cvUrl")}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FileText className="h-4 w-4" /> Ver CV
                                </a>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleRemoveCv}
                                    title="Quitar CV"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </Card>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Datos personales */}
                <Card className="space-y-3 rounded-xl border bg-white p-4">
                    <h3 className="text-sm font-semibold text-slate-700">Datos personales</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Nombre" {...form.register("nombre")} />
                        <Field label="Apellido" {...form.register("apellido")} />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Correo</FormLabel>
                                    <FormControl>
                                        <Input type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="telefono"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Teléfono</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="tel"
                                            inputMode="numeric"
                                            maxLength={8}
                                            value={field.value ?? ""}
                                            onChange={(event) => {
                                                const sanitizedValue = event.target.value.replace(/\D/g, "").slice(0, 8)
                                                field.onChange(sanitizedValue)
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Field label="Dirección" className="md:col-span-2" {...form.register("direccion")} />
                        <Field label="Fecha de nacimiento" type="date" {...form.register("fechaNacimiento")} />

                        {/* Género */}
                        <div className="md:col-span-1">
                            <Label className="mb-1 block text-sm">Género</Label>
                            <Controller
                                name="genero"
                                control={form.control}
                                render={({ field }) => (
                                    <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || undefined)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecciona género" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {GENEROS.map((g) => (
                                                <SelectItem key={g} value={g}>
                                                    {g.charAt(0) + g.slice(1).toLowerCase()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        {/* Departamento */}
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
                                            form.setValue("ubicacionCiudadId", undefined as unknown as number, {
                                                shouldValidate: true, shouldDirty: true,
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

                        {/* Ciudad */}
                        <div className="md:col-span-1">
                            <Label className="mb-1 block text-sm">Ciudad</Label>
                            <Controller
                                name="ubicacionCiudadId"
                                control={form.control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value?.toString() ?? ""}
                                        onValueChange={(v) => field.onChange(Number(v))}
                                        disabled={!deptoId || loadingCiudades}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={!deptoId ? "Seleccione un departamento primero" : loadingCiudades ? "Cargando..." : "Seleccione una ciudad"} />
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
                    <Label htmlFor="summary" className="sr-only">Resumen</Label>
                    <Textarea id="summary" rows={4} placeholder="Breve introducción (máx. 600)" {...form.register("resumen")} />
                </Card>

                {/* Preferencias y disponibilidad */}
                <Card className="space-y-3 rounded-xl border bg-white p-4">
                    <h3 className="text-sm font-semibold text-slate-700">Preferencias</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Disponibilidad */}
                        <div>
                            <Label className="mb-1 block text-sm">Disponibilidad</Label>
                            <Controller
                                name="disponibilidad"
                                control={form.control}
                                render={({ field }) => (
                                    <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || undefined)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecciona disponibilidad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DISPONIBILIDADES.map((d) => (
                                                <SelectItem key={d} value={d}>
                                                    {d}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        {/* Switches */}
                        <SwitchRow
                            label="Disponible para viajar"
                            checked={!!form.watch("disponibilidadViajar")}
                            onCheckedChange={(v) => form.setValue("disponibilidadViajar", v, { shouldDirty: true })}
                        />
                        <SwitchRow
                            label="Cambio de residencia"
                            checked={!!form.watch("cambioResidencia")}
                            onCheckedChange={(v) => form.setValue("cambioResidencia", v, { shouldDirty: true })}
                        />
                        <SwitchRow
                            label="Posee vehículo"
                            checked={!!form.watch("poseeVehiculo")}
                            onCheckedChange={(v) => form.setValue("poseeVehiculo", v, { shouldDirty: true })}
                        />
                    </div>
                </Card>

                {/* Experiencia */}
                <Card className="space-y-3 rounded-xl border bg-white p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-700">Experiencia laboral</h3>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                                expArray.append({ empresa: "", puesto: "", fechaInicio: "", fechaFin: "", descripcion: "" })
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
                                    <Button type="button" variant="destructive" size="sm" onClick={() => expArray.remove(index)} className="gap-1">
                                        <Trash2 className="h-4 w-4" /> Eliminar
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <Field label="Empresa" {...form.register(`experiencia.${index}.empresa` as const)} />
                                    <Field label="Puesto" {...form.register(`experiencia.${index}.puesto` as const)} />
                                    <Field label="Fecha inicio" type="date" {...form.register(`experiencia.${index}.fechaInicio` as const)} />
                                    <Field label="Fecha fin" type="date" {...form.register(`experiencia.${index}.fechaFin` as const)} />
                                    <div className="md:col-span-2">
                                        <Label className="mb-1 block text-sm">Descripción breve</Label>
                                        <Textarea rows={3} {...form.register(`experiencia.${index}.descripcion` as const)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Educación */}
                <Card className="space-y-3 rounded-xl border bg-white p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-700">Formación académica</h3>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => eduArray.append({ institucion: "", titulo: "", fechaInicio: "", fechaFin: "" })}
                        >
                            <Plus className="h-4 w-4" /> Agregar
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {eduArray.fields.map((field, index) => (
                            <div key={field.id} className="rounded-lg border p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <p className="text-sm font-medium text-slate-800">Educación {index + 1}</p>
                                    <Button type="button" variant="destructive" size="sm" onClick={() => eduArray.remove(index)} className="gap-1">
                                        <Trash2 className="h-4 w-4" /> Eliminar
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <Field label="Institución" {...form.register(`educacion.${index}.institucion` as const)} />
                                    <Field label="Título" {...form.register(`educacion.${index}.titulo` as const)} />
                                    <Field label="Fecha inicio" type="date" {...form.register(`educacion.${index}.fechaInicio` as const)} />
                                    <Field label="Fecha fin" type="date" {...form.register(`educacion.${index}.fechaFin` as const)} />
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
                    <Button type="button" variant="outline" disabled={saving}>Cancelar</Button>
                    <Button type="submit" disabled={saving || !form.formState.isValid}>
                        {saving ? "Guardando..." : "Guardar cambios"}
                    </Button>
                </div>
                </form>
            </Form>
        </section>
    );
}

/* ───────────────── helpers ───────────────── */

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

function SwitchRow({
    label,
    checked,
    onCheckedChange,
}: {
    label: string;
    checked: boolean;
    onCheckedChange: (v: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between rounded-lg border p-2">
            <span className="text-sm text-slate-600">{label}</span>
            <Switch checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    );
}

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
