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
import { useState } from "react";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { ofertaLaboralFormSchema, ofertaLaboralUpdateSchema, OfertaLaboralFormData, OfertaLaboralUpdateData } from "@/lib/schemas/ofertaLaboralSchema";
import { InitialDataUpdateOfertaLaboral } from "@/types";


type FormCreateProps = {
    setOpenModalCreate: Dispatch<SetStateAction<boolean>>
    initialData?: InitialDataUpdateOfertaLaboral | null,
    isEditMode: boolean
}

export function FormCreateOferta({ setOpenModalCreate, initialData, isEditMode = false }: FormCreateProps) {

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const defaultValues = initialData ? {
        puesto: initialData.puesto,
        descripcionPuesto: initialData.descripcionPuesto,
        area: initialData.area || "",
        ubicacionPais: initialData.ubicacionPais,
        ubicacionDepartamento: initialData.ubicacionDepartamento,
        ubicacionCiudad: initialData.ubicacionCiudad,
        empresa: initialData.empresa,
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
        ubicacionPais: "",
        ubicacionDepartamento: "",
        ubicacionCiudad: "",
        empresa: "",
        nivelAcademico: "",
        experienciaLaboral: "",
        tipoTrabajo: undefined,
        modalidad: undefined,
        salario: undefined,
    };
    const form = useForm<OfertaLaboralFormData | OfertaLaboralUpdateData>({
        resolver: zodResolver(isEditMode ? ofertaLaboralUpdateSchema : ofertaLaboralFormSchema),
        defaultValues: defaultValues,
        mode: "onChange",
        reValidateMode: "onChange",
    });

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

    const paises = ["Honduras", "El Salvador", "Guatemala", "Nicaragua", "Costa Rica"];

    const departamentos = [
        "Atlántida", "Colón", "Comayagua", "Copán", "Cortés", "Choluteca",
        "El Paraíso", "Francisco Morazán", "Gracias a Dios", "Intibucá",
        "Islas de la Bahía", "La Paz", "Lempira", "Ocotepeque",
        "Olancho", "Santa Bárbara", "Valle", "Yoro"
    ];

    const ciudadesPorDepartamento: Record<string, string[]> = {
        "Francisco Morazán": ["Tegucigalpa", "Valle de Ángeles", "Santa Lucía"],
        "Cortés": ["San Pedro Sula", "Puerto Cortés", "Choloma"],
        "Atlántida": ["La Ceiba", "Tela", "Jutiapa"],
        "Yoro": ["El Progreso", "Yoro", "Olanchito"],
        "Choluteca": ["Choluteca", "San Marcos de Colón"],
    };

    const paisSeleccionado = form.watch("ubicacionPais");
    const deptoSeleccionado = form.watch("ubicacionDepartamento");

    const onSubmit = async (data: OfertaLaboralFormData) => {
        setError(null);
        setIsLoading(true)

        try {
            const payload = {
                ...data,
                agregadoPorId: undefined,
                estado: "PENDIENTE",
            };
            if (isEditMode) {
                await axios.put(`/api/ofertaslaborales/${initialData?.id}`, payload)
                toast.success("Oferta Laboral actualizada correctamente")
                console.log("Oferta Laboral actualizada correctamente", payload)
            } else {
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
                        <CardContent className="grid grid-cols-3 gap-4">
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
                                name="empresa"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Empresa</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nombre de la empresa" {...field} />
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
                                            <SelectTrigger>
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

                            <FormField
                                name="ubicacionPais"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>País</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                form.setValue("ubicacionDepartamento", "");
                                                form.setValue("ubicacionCiudad", "");
                                            }}
                                            value={field.value || ""}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione un país" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {paises.map((pais) => (
                                                    <SelectItem key={pais} value={pais}>
                                                        {pais}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {paisSeleccionado === "Honduras" && (
                                <FormField
                                    name="ubicacionDepartamento"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Departamento</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    form.setValue("ubicacionCiudad", "");
                                                }}
                                                value={field.value || ""}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione un departamento" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {departamentos.map((dep) => (
                                                        <SelectItem key={dep} value={dep}>
                                                            {dep}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {paisSeleccionado === "Honduras" &&
                                deptoSeleccionado &&
                                ciudadesPorDepartamento[deptoSeleccionado] && (
                                    <Controller
                                        name="ubicacionCiudad"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ciudad</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value || ""}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione una ciudad" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {ciudadesPorDepartamento[deptoSeleccionado].map((ciudad) => (
                                                            <SelectItem key={ciudad} value={ciudad}>
                                                                {ciudad}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

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

                            <FormField
                                control={form.control}
                                name="salario"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Salario</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Ej. 5000"
                                                {...field}
                                                value={field.value ?? 0}
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