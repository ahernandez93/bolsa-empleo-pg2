"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ofertaLaboralFormSchema, ofertaLaboralUpdateSchema, OfertaLaboralFormData, OfertaLaboralUpdateData } from "@/lib/schemas/ofertaLaboralSchema";
import { InitialDataUpdateOfertaLaboral } from "@/types";
import useSWR from "swr";
import dynamic from "next/dynamic";
import { Separator } from "@/components/ui/separator";
// evita SSR del editor
const Wysiwyg = dynamic(() => import("@/components/richtext/Wysiwyg"), { ssr: false });


type FormCreateProps = {
    setOpenModalCreate: Dispatch<SetStateAction<boolean>>
    initialData?: InitialDataUpdateOfertaLaboral | null,
    isEditMode: boolean
}

type FormBase = z.infer<typeof ofertaLaboralFormSchema> & Partial<Pick<z.infer<typeof ofertaLaboralUpdateSchema>, "estado">>;

const fetcher = (url: string) => axios.get(url).then((r) => r.data);

export function FormCreateOferta({ setOpenModalCreate, initialData, isEditMode = false }: FormCreateProps) {

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const defaultValues = initialData ? {
        puesto: initialData.puesto,
        descripcionPuesto: initialData.descripcionPuesto,
        area: initialData.area || "",
        ubicacionDepartamentoId: initialData.ubicacionDepartamentoId ?? undefined,
        ubicacionCiudadId: initialData.ubicacionCiudadId ?? undefined,
        nivelAcademico: initialData.nivelAcademico,
        experienciaLaboral: initialData.experienciaLaboral,
        tipoTrabajo: initialData.tipoTrabajo,
        modalidad: initialData.modalidad,
        salario: initialData.salario,
        estado: initialData.estado,
    } : {
        puesto: "",
        descripcionPuesto: "",
        area: "",
        ubicacionDepartamentoId: undefined,
        ubicacionCiudadId: undefined,
        nivelAcademico: "",
        experienciaLaboral: "",
        tipoTrabajo: undefined,
        modalidad: undefined,
        salario: 0,
    };

    const form = useForm<FormBase>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(isEditMode ? ofertaLaboralUpdateSchema : ofertaLaboralFormSchema) as any,
        defaultValues: defaultValues,
        mode: "onChange",
        reValidateMode: "onChange",
    });

    useEffect(() => {
        if (isEditMode && initialData) {
            form.reset({
                puesto: initialData.puesto,
                descripcionPuesto: initialData.descripcionPuesto,
                area: initialData.area || "",
                ubicacionDepartamentoId: initialData.ubicacionDepartamentoId ?? undefined,
                ubicacionCiudadId: initialData.ubicacionCiudadId ?? undefined,
                nivelAcademico: initialData.nivelAcademico,
                experienciaLaboral: initialData.experienciaLaboral,
                tipoTrabajo: initialData.tipoTrabajo,
                modalidad: initialData.modalidad,
                salario: initialData.salario,
                estado: initialData.estado,
            } satisfies Partial<FormBase>);
        } else if (!isEditMode) {
            form.reset({
                puesto: "",
                descripcionPuesto: "",
                area: "",
                ubicacionDepartamentoId: undefined,
                ubicacionCiudadId: undefined,
                nivelAcademico: "",
                experienciaLaboral: "",
            } satisfies Partial<FormBase>);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode, initialData]);

    const isValid = form.formState.isValid;

    const areas = [
        "Recursos Humanos",
        "Finanzas",
        "Contabilidad",
        "Ventas",
        "Marketing",
        "Atención al Cliente",
        "Operaciones",
        "Producción",
        "Logística",
        "Compras",
        "Tecnología / IT",
        "Desarrollo de Software",
        "Calidad",
        "Legal",
        "Administración",
        "Dirección General"
    ];

    const { data: departamentos, isLoading: loadingDeptos } = useSWR<{ id: number; nombre: string }[]>(
        "/api/ubicaciones/departamentos",
        fetcher
    );

    const deptoId = form.watch("ubicacionDepartamentoId");
    const { data: ciudades, isLoading: loadingCiudades } = useSWR<{ id: number; nombre: string }[]>(
        typeof deptoId === "number" ? `/api/ubicaciones/ciudades?departamentoId=${deptoId}` : null,
        fetcher
    );

    const onSubmit = async (data: OfertaLaboralFormData | OfertaLaboralUpdateData) => {
        setError(null);
        setIsLoading(true)

        try {
            if (isEditMode) {
                const payload = data as OfertaLaboralUpdateData;
                await axios.put(`/api/ofertaslaborales/${initialData?.id}`, payload)
                toast.success("Oferta Laboral actualizada correctamente")
                console.log("Oferta Laboral actualizada correctamente", payload)
            } else {
                const payload = data as OfertaLaboralFormData;
                await axios.post("/api/ofertaslaborales", payload)
                toast.success("Oferta Laboral creada exitosamente")
                console.log("Oferta Laboral creada exitosamente", payload)
            }

            form.reset()
            router.refresh()
            setOpenModalCreate(false)
        } catch (err) {
            setIsLoading(false);
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message);
                toast.error(`Error al crear la oferta laboral: ${err.response?.data?.message ?? "Desconocido"}`);
            } else {
                setError("Error inesperado al crear la oferta laboral");
                toast.error("Error inesperado al crear la oferta laboral");
            }
        } finally {
            setIsLoading(false)
        }
    }
    /* console.log(form.formState.isValid)
    console.log(form.formState.errors) */
    /*    console.log("Errores del formulario:", form.formState.errors);
       console.log("Valores actuales:", form.getValues()); */
    const focusSlim = "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-ring";

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 oferta-form">
                {/* Sección 1: Datos generales */}
                <section className="rounded-xl bg-muted/5 p-6">
                    <h3 className="text-base font-semibold">Datos Generales del Puesto</h3>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Puesto */}
                        <FormField
                            control={form.control}
                            name="puesto"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Puesto</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Puesto" {...field} className={focusSlim} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Área */}
                        <FormField
                            control={form.control}
                            name="area"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Área</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                        <SelectTrigger className={`w-full ${focusSlim}`}>
                                            <SelectValue placeholder="Seleccione un área" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {areas.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Ubicación (2 cols) */}
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Departamento */}
                            <Controller
                                name="ubicacionDepartamentoId"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Departamento</FormLabel>
                                        <Select
                                            value={field.value?.toString() ?? ""}
                                            onValueChange={(v) => {
                                                field.onChange(Number(v));
                                                form.setValue("ubicacionCiudadId", undefined as unknown as number, { shouldValidate: true, shouldDirty: true });
                                            }}
                                            disabled={loadingDeptos}
                                        >
                                            <SelectTrigger className={`w-full ${focusSlim}`}>
                                                <SelectValue placeholder={loadingDeptos ? "Cargando..." : "Seleccione un departamento"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(departamentos ?? []).map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.nombre}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Ciudad */}
                            {form.watch("ubicacionDepartamentoId") ? (
                                <Controller
                                    name="ubicacionCiudadId"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ciudad</FormLabel>
                                            <Select
                                                value={field.value?.toString() ?? ""}
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                disabled={loadingCiudades}
                                            >
                                                <SelectTrigger className={`w-full ${focusSlim}`}>
                                                    <SelectValue placeholder={loadingCiudades ? "Cargando..." : "Seleccione una ciudad"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(ciudades ?? []).map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ) : (
                                <FormItem>
                                    <FormLabel>Ciudad</FormLabel>
                                    <Select disabled>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccione primero un departamento" />
                                        </SelectTrigger>
                                    </Select>
                                </FormItem>
                            )}
                        </div>

                        {/* Descripción (ancho completo) */}
                        <FormField
                            control={form.control}
                            name="descripcionPuesto"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Descripción del Puesto</FormLabel>
                                    <Wysiwyg
                                        value={field.value}
                                        onChange={field.onChange}
                                        // asegurate que tu Wysiwyg acepte className para el editor, o añade regla global
                                        // cla  ssNameEditor={`${focusSlim} outline-none`}
                                        placeholder="Describe responsabilidades, requisitos, beneficios..."
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </section>

                {/* Sección 2: Requisitos */}
                <section className="rounded-xl bg-muted/5 p-6">
                    <h3 className="text-base font-semibold">Requisitos del Puesto</h3>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nivel Académico */}
                        <FormField
                            control={form.control}
                            name="nivelAcademico"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nivel Académico</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                        <SelectTrigger className={focusSlim}>
                                            <SelectValue placeholder="Seleccione nivel académico" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SECUNDARIA">Secundaria</SelectItem>
                                            <SelectItem value="BACHILLERATO">Bachillerato</SelectItem>
                                            <SelectItem value="LICENCIATURA">Licenciatura</SelectItem>
                                            <SelectItem value="MAESTRIA">Maestría</SelectItem>
                                            <SelectItem value="DOCTORADO">Doctorado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Experiencia */}
                        <FormField
                            control={form.control}
                            name="experienciaLaboral"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Experiencia Laboral</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                        <SelectTrigger className={focusSlim}>
                                            <SelectValue placeholder="Seleccione experiencia laboral" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Menos de 1 año</SelectItem>
                                            <SelectItem value="1">1 año</SelectItem>
                                            <SelectItem value="2">2 años</SelectItem>
                                            <SelectItem value="3">3 años</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Tipo / Modalidad */}
                        <FormField
                            control={form.control}
                            name="tipoTrabajo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Trabajo</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                        <SelectTrigger className={focusSlim}>
                                            <SelectValue placeholder="Seleccione tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PERMANENTE">Permanente</SelectItem>
                                            <SelectItem value="TEMPORAL">Temporal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="modalidad"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Modalidad</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                        <SelectTrigger className={focusSlim}>
                                            <SelectValue placeholder="Seleccione modalidad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                                            <SelectItem value="REMOTO">Remoto</SelectItem>
                                            <SelectItem value="HIBRIDO">Híbrido</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Salario */}
                        <Controller
                            control={form.control}
                            name="salario"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Salario</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            inputMode="decimal"
                                            min={0}
                                            step="0.01"
                                            placeholder="Ej. 5000"
                                            value={Number.isFinite(field.value as number) ? (field.value as number) : 0}
                                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                            className={focusSlim}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Estado solo en editar */}
                        {isEditMode && (
                            <FormField
                                control={form.control}
                                name="estado"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                            <SelectTrigger className={focusSlim}>
                                                <SelectValue placeholder="Seleccione estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                                                <SelectItem value="ABIERTA">Abierta</SelectItem>
                                                <SelectItem value="RECHAZADA">Rechazada</SelectItem>
                                                <SelectItem value="CERRADA">Cerrada</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                </section>

                <Button type="submit" className="w-full" disabled={!isValid || isLoading}>
                    {isEditMode ? "Guardar cambios" : "Registrar Oferta"}
                </Button>
                {error && <p className="text-red-600 text-center -mt-4">{error}</p>}
            </form>
        </Form>
    );
}
