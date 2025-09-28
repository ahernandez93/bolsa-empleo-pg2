"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { empleadoPerfilSchema, EmpleadoPerfilInput } from "@/lib/schemas/empleadoPerfilSchema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { toast } from "sonner";
import useSWR from "swr";
import type { EmpleadoPerfilDTO, ApiErrorResponse } from "@/types";
import { isAxiosError } from "axios";

type Props = {
    initial: EmpleadoPerfilDTO;
    onSaved: () => void;
};

type OpcionUbicacion = { id: number; nombre: string };

const fetcher = (url: string) => axios.get(url).then(r => r.data);

export default function PerfilEmpleadoForm({ initial, onSaved }: Props) {
    const form = useForm<EmpleadoPerfilInput>({
        resolver: zodResolver(empleadoPerfilSchema),
        defaultValues: {
            nombre: initial.nombre ?? "",
            apellido: initial.apellido ?? "",
            telefono: initial.telefono ?? "",
            direccion: initial.direccion ?? "",
            fechaNacimiento: initial.fechaNacimiento ?? "",
            genero: initial.genero ?? "",
            ubicacionDepartamentoId: initial.ubicacionDepartamentoId ?? undefined,
            ubicacionCiudadId: initial.ubicacionCiudadId ?? undefined,
        },
        mode: "onChange",
    });

    const departamentoId = form.watch("ubicacionDepartamentoId");
    const { data: departamentos } = useSWR<OpcionUbicacion[]>("/api/ubicaciones/departamentos", fetcher);
    const { data: ciudades } = useSWR<OpcionUbicacion[]>(
        typeof departamentoId === "number" ? `/api/ubicaciones/ciudades?departamentoId=${departamentoId}` : null,
        fetcher
    );

    const onSubmit = async (data: EmpleadoPerfilInput) => {
        try {
            await axios.put("/api/empleados/perfil", {
                ...data,
                // asegurar números (RHF puede mandar string si usamos Select)
                ubicacionDepartamentoId: typeof data.ubicacionDepartamentoId === "string" ? Number(data.ubicacionDepartamentoId) : data.ubicacionDepartamentoId,
                ubicacionCiudadId: typeof data.ubicacionCiudadId === "string" ? Number(data.ubicacionCiudadId) : data.ubicacionCiudadId,
            });
            toast.success("Perfil actualizado");
            onSaved();
        } catch (err: unknown) {
            if (isAxiosError<ApiErrorResponse>(err)) {
                const msg = err.response?.data?.message ?? "No se pudo actualizar";
                toast.error(msg);
            } else {
                toast.error("No se pudo actualizar");
            }
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                    <FormField
                        control={form.control}
                        name="nombre"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl><Input {...field} placeholder="Nombre" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="apellido"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Apellido</FormLabel>
                                <FormControl><Input {...field} placeholder="Apellido" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <FormField
                        control={form.control}
                        name="telefono"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Teléfono</FormLabel>
                                <FormControl><Input {...field} placeholder="Ej: 9999-9999" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="fechaNacimiento"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha de nacimiento</FormLabel>
                                <FormControl><Input type="date" value={field.value ?? ""} onChange={field.onChange} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="direccion"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Dirección</FormLabel>
                            <FormControl><Input {...field} placeholder="Dirección" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-3">
                    <FormField
                        control={form.control}
                        name="genero"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Género</FormLabel>
                                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                                    <SelectTrigger><SelectValue placeholder="Seleccione género" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MASCULINO">Masculino</SelectItem>
                                        <SelectItem value="FEMENINO">Femenino</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Controller
                        control={form.control}
                        name="ubicacionDepartamentoId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Departamento</FormLabel>
                                <Select value={field.value?.toString() ?? ""} onValueChange={(v) => field.onChange(Number(v))}>
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
                </div>

                <Controller
                    control={form.control}
                    name="ubicacionCiudadId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ciudad</FormLabel>
                            <Select
                                value={field.value?.toString() ?? ""}
                                onValueChange={(v) => field.onChange(Number(v))}
                                disabled={!departamentoId}
                            >
                                <SelectTrigger><SelectValue placeholder={departamentoId ? "Seleccione" : "Seleccione primero un departamento"} /></SelectTrigger>
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

                <Button type="submit" className="mt-2">Guardar cambios</Button>
            </form>
        </Form>
    );
}
