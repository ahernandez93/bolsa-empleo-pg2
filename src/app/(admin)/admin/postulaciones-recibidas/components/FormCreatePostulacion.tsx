"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dispatch, SetStateAction } from "react";
import { InitialDataUpdatePostulacion } from "@/types";
import { postulacionFormSchema, PostulacionFormData } from "@/lib/schemas/postulacionSchema";

type FormEditProps = {
    setOpenModalEdit: Dispatch<SetStateAction<boolean>>
    initialData: InitialDataUpdatePostulacion;
};

type Estado = "SOLICITUD" | "ENTREVISTA" | "EVALUACIONES" | "CONTRATACION" | "RECHAZADA"

const ESTADO_CONFIG: Record<Estado, { label: string; badgeClass: string; dotColor: string }> = {
    SOLICITUD: { label: "Solicitud", badgeClass: "bg-muted text-foreground", dotColor: "bg-gray-400" },
    ENTREVISTA: { label: "Entrevista", badgeClass: "bg-blue-600 text-white", dotColor: "bg-blue-600" },
    EVALUACIONES: { label: "Evaluaciones", badgeClass: "bg-yellow-500 text-white", dotColor: "bg-yellow-500" },
    CONTRATACION: { label: "Contratación", badgeClass: "bg-green-600 text-white", dotColor: "bg-green-600" },
    RECHAZADA: { label: "Rechazada", badgeClass: "bg-red-600 text-white", dotColor: "bg-red-600" },
}

const ORDER: Record<Exclude<Estado, "RECHAZADA">, number> = {
    SOLICITUD: 0,
    ENTREVISTA: 1,
    EVALUACIONES: 2,
    CONTRATACION: 3,
}

const ALL_ESTADOS: Estado[] = ["SOLICITUD", "ENTREVISTA", "EVALUACIONES", "CONTRATACION", "RECHAZADA"]

function isFinalEstado(estado: Estado) {
    return estado === "CONTRATACION" || estado === "RECHAZADA"
}

function isAllowedOption(current: Estado, candidate: Estado) {
    if (candidate === current) return true
    if (isFinalEstado(current)) return false
    if (candidate === "RECHAZADA") return true

    const currentRank = ORDER[current as Exclude<Estado, "RECHAZADA">]
    const candidateRank = ORDER[candidate as Exclude<Estado, "RECHAZADA">]
    return candidateRank >= currentRank
}


export function FormEditPostulacion({ setOpenModalEdit, initialData }: FormEditProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<PostulacionFormData>({
        resolver: zodResolver(postulacionFormSchema),
        defaultValues: {
            estado: initialData.estado,
            notasInternas: initialData.notasInternas ?? "",
        },
        mode: "onChange",
        reValidateMode: "onChange",
    });

    useEffect(() => {
        form.reset({
            estado: initialData.estado,
            notasInternas: initialData.notasInternas ?? "",
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData]);

    const isValid = form.formState.isValid;

    const onSubmit = async (data: PostulacionFormData) => {
        setError(null);
        setIsLoading(true);
        try {
            await axios.patch(`/api/postulaciones/${initialData.id}`, {
                estado: data.estado,
                notasInternas: data.notasInternas?.trim() || null,
            });

            toast.success("Postulación actualizada correctamente");
            form.reset();
            router.refresh();
            setOpenModalEdit(false);
        } catch (err) {
            setIsLoading(false);
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message);
                toast.error(`Error al actualizar la postulación: ${err.response?.data?.message ?? "Desconocido"}`);
            } else {
                setError("Error inesperado al actualizar la postulación");
                toast.error("Error inesperado al actualizar la postulación");
            }
        } finally {
            setIsLoading(false)
        }
    };

    const fechaLegible = new Date(initialData.fechaPostulacion).toLocaleDateString("es-HN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    return (
        <div className="max-w-3xl mx-auto h-[70vh] overflow-y-auto p-0">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    <Card>
                        <CardHeader>
                            <CardTitle>Detalles de la Postulación</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            {/* Solo lectura */}
                            <FormItem>
                                <FormLabel>Puesto</FormLabel>
                                <FormControl>
                                    <Input value={initialData.ofertaPuesto} disabled readOnly />
                                </FormControl>
                            </FormItem>

                            <FormItem>
                                <FormLabel>Fecha de Postulación</FormLabel>
                                <FormControl>
                                    <Input value={fechaLegible} disabled readOnly />
                                </FormControl>
                            </FormItem>

                            <FormItem>
                                <FormLabel>Candidato</FormLabel>
                                <FormControl>
                                    <Input
                                        value={initialData.candidatoNombre?.trim() || "—"}
                                        disabled
                                        readOnly
                                    />
                                </FormControl>
                            </FormItem>

                            <FormItem>
                                <FormLabel>Correo del Candidato</FormLabel>
                                <FormControl>
                                    <Input value={initialData.candidatoEmail} disabled readOnly />
                                </FormControl>
                            </FormItem>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Gestión (solo reclutador)</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="estado"
                                render={({ field }) => {
                                    const cfg = ESTADO_CONFIG[field.value as Estado]

                                    return (
                                        <FormItem>
                                            <FormLabel>Estado</FormLabel>
                                            <Select
                                                disabled={isLoading || isFinalEstado(field.value as Estado)}
                                                value={field.value || ""}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger className="h-8 w-[160px]">
                                                    {cfg ? (
                                                        <Badge className={`justify-center w-full ${cfg.badgeClass}`}>
                                                            {cfg.label}
                                                        </Badge>
                                                    ) : (
                                                        <SelectValue placeholder="Seleccione estado" />
                                                    )}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ALL_ESTADOS
                                                        .filter((estado) => isAllowedOption(field.value as Estado, estado))
                                                        .map((key) => {
                                                            const c = ESTADO_CONFIG[key]
                                                            return (
                                                                <SelectItem key={key} value={key}>
                                                                    <span className="inline-flex items-center gap-2">
                                                                        <span className={`inline-block h-2 w-2 rounded-full ${c.dotColor}`} />
                                                                        {c.label}
                                                                    </span>
                                                                </SelectItem>
                                                            )
                                                        })}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>

                                    )
                                }}
                            />


                            <FormField
                                control={form.control}
                                name="notasInternas"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-1 col-span-1">
                                        <FormLabel>Notas internas</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                rows={6}
                                                placeholder="Notas privadas del reclutador…"
                                                {...field}
                                                value={field.value ?? ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <div>
                        <Button type="submit" className="w-full" disabled={!isValid || isLoading}>
                            Guardar cambios
                        </Button>
                        {error && <p className="text-red-600 text-center mt-2">{error}</p>}
                    </div>
                </form>
            </Form>
        </div>
    );
}
