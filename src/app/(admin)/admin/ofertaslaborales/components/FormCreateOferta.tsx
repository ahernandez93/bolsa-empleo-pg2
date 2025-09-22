"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
    return (
        <div className="max-w-4xl mx-auto h-[80vh] overflow-y-auto p-0">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    <Card>
                        <CardHeader>
                            <CardTitle>Datos Generales del Puesto</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="puesto"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Puesto</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Puesto" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="area"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Área</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Seleccione un área" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {areas.map((area) => (
                                                    <SelectItem key={area} value={area}>
                                                        {area}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Fila de ubicación: 2 columnas limpias, ocupa todo el ancho de la tarjeta */}
                            <div className="col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Departamento */}
                                <div className="min-w-2">
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
                                </div>

                                <div className="min-w-0">
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
                                </div>
                            </div>


                            <FormField
                                control={form.control}
                                name="descripcionPuesto"
                                render={({ field }) => (
                                    <FormItem className="col-span-3">
                                        <FormLabel>Descripción del Puesto</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe detalladamente el puesto, responsabilidades y expectativas..."
                                                {...field}
                                                rows={5}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Requisitos del Puesto</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="nivelAcademico"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nivel Académico</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione nivel académico" />
                                                </SelectTrigger>
                                            </FormControl>
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

                            <FormField
                                control={form.control}
                                name="experienciaLaboral"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Experiencia Laboral</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione experiencia laboral" />
                                                </SelectTrigger>
                                            </FormControl>
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

                            <FormField
                                control={form.control}
                                name="tipoTrabajo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Trabajo</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione tipo" />
                                                </SelectTrigger>
                                            </FormControl>
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
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione modalidad" />
                                                </SelectTrigger>
                                            </FormControl>
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
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {isEditMode && (
                                <FormField
                                    control={form.control}
                                    name="estado"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estado</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value || ""}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione estado" />
                                                    </SelectTrigger>
                                                </FormControl>
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
                        </CardContent>
                    </Card>

                    <div>
                        <Button type="submit" className="w-full" disabled={!isValid || isLoading}>
                            {isEditMode ? "Guardar cambios" : "Registrar Oferta"}
                        </Button>
                        {error && <p className="text-red-600 text-center mt-2">{error}</p>}
                    </div>

                </form>
            </Form>
        </div>
    );
}
