"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    empresaConfigSchema,
    type EmpresaConfigInput,
} from "@/lib/schemas/empresaConfigSchema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import axios, { isAxiosError } from "axios";
import useSWR from "swr";
import { toast } from "sonner";
import type { EmpresaConfigDTO, ApiErrorResponse } from "@/types";

type Props = {
    initial: EmpresaConfigDTO;
    onSaved: () => void;
};

type OpcionUbicacion = { id: number; nombre: string };
const fetcher = <T,>(url: string) => axios.get<T>(url).then(r => r.data);

export default function EmpresaConfigForm({ initial, onSaved }: Props) {
    const form = useForm<EmpresaConfigInput>({
        resolver: zodResolver(empresaConfigSchema),
        defaultValues: {
            nombre: initial.nombre,
            rtn: initial.rtn ?? "",
            sitioWeb: initial.sitioWeb ?? "",
            telefono: initial.telefono ?? "",
            descripcion: initial.descripcion ?? "",
            ubicacionDepartamentoId: initial.ubicacionDepartamentoId ?? undefined,
            ubicacionCiudadId: initial.ubicacionCiudadId ?? undefined,
            activa: initial.activa,
        },
        mode: "onChange",
    });

    const deptoId = form.watch("ubicacionDepartamentoId");

    const { data: departamentos } = useSWR<OpcionUbicacion[]>(
        "/api/ubicaciones/departamentos",
        fetcher<OpcionUbicacion[]>
    );
    const { data: ciudades } = useSWR<OpcionUbicacion[]>(
        typeof deptoId === "number" ? `/api/ubicaciones/ciudades?departamentoId=${deptoId}` : null,
        fetcher<OpcionUbicacion[]>
    );

    const onSubmit = async (data: EmpresaConfigInput) => {
        try {
            await axios.put<void>("/api/empresa/config", {
                ...data,
                ubicacionDepartamentoId:
                    typeof data.ubicacionDepartamentoId === "string"
                        ? Number(data.ubicacionDepartamentoId)
                        : data.ubicacionDepartamentoId,
                ubicacionCiudadId:
                    typeof data.ubicacionCiudadId === "string"
                        ? Number(data.ubicacionCiudadId)
                        : data.ubicacionCiudadId,
            });
            toast.success("Empresa actualizada");
            onSaved();
        } catch (err: unknown) {
            const msg =
                isAxiosError<ApiErrorResponse>(err)
                    ? err.response?.data?.message ?? "No se pudo actualizar"
                    : "No se pudo actualizar";
            toast.error(msg);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
                <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl><Input {...field} placeholder="Nombre de la empresa" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-3">
                    <FormField
                        control={form.control}
                        name="rtn"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>RTN</FormLabel>
                                <FormControl><Input {...field} placeholder="RTN / NIF / RFC" /></FormControl>
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
                                    {...field}
                                    placeholder="Ej. 9999-9999"
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
                </div>

                <FormField
                    control={form.control}
                    name="sitioWeb"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Sitio web</FormLabel>
                            <FormControl><Input {...field} placeholder="https://…" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="descripcion"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                                <Textarea {...field} rows={4} placeholder="Describe tu empresa…" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-3">
                    <Controller
                        control={form.control}
                        name="ubicacionDepartamentoId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Departamento</FormLabel>
                                <Select
                                    value={field.value?.toString() ?? ""}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                >
                                    <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                                    <SelectContent>
                                        {(departamentos ?? []).map((d) => (
                                            <SelectItem key={d.id} value={d.id.toString()}>{d.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Controller
                        control={form.control}
                        name="ubicacionCiudadId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ciudad</FormLabel>
                                <Select
                                    value={field.value?.toString() ?? ""}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    disabled={!deptoId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={deptoId ? "Seleccione" : "Seleccione primero un departamento"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(ciudades ?? []).map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="mt-2">Guardar cambios</Button>
            </form>
        </Form>
    );
}
