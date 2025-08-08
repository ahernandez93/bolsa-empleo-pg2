
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { empleadoSchema, EmpleadoFormData } from "@/lib/schemas/empleadoSchema";
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios/* , { AxiosError } */ from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";



type FormCreateProps = {
    setOpenModalCreate: Dispatch<SetStateAction<boolean>>
}

export function FormCreateEmpleado(props: FormCreateProps) {

    const { setOpenModalCreate } = props;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<EmpleadoFormData>({
        resolver: zodResolver(empleadoSchema),
        defaultValues: {
            nombre: "",
            apellido: "",
            telefono: "",
            direccion: "",
            fechaNacimiento: "",
            email: "",
            password: "",
            rol: "RECLUTADOR",
            departamento: "",
            cargo: "",
        },
    });

    const isValid = form.formState.isValid;

    const onSubmit = async (data: EmpleadoFormData) => {
        setMensaje(null);
        setError(null);

        try {
            setIsLoading(true);
            const res = await axios.post("/api/empleados", data);
            setMensaje(res.data.message || "Empleado creado con éxito");
            form.reset();
            router.refresh();
            setOpenModalCreate(false);
            toast.success("Empleado creado exitosamente");
        } catch (err) {
            setIsLoading(false);
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message);
                toast.error(`Error al crear el empleado: ${err.response?.data?.message ?? "Desconocido"}`);
            } else {
                setError("Error inesperado al crear empleado");
                toast.error("Error inesperado al crear el empleado");
            }
        }
        console.log(data);
    }

    return (
        <Form {...form}>
            {/* <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="nombre"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nombre" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />


                    <FormField
                        control={form.control}
                        name="direccion"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dirección</FormLabel>
                                <FormControl>
                                    <Input placeholder="Dirección" {...field} />
                                </FormControl>
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
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contraseña</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="rol"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rol</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un rol" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="RECLUTADOR">Reclutador</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="departamento"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Departamento</FormLabel>
                                <FormControl>
                                    <Input placeholder="TI, RRHH, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="cargo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cargo</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej: Desarrollador" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" disabled={!isValid || isLoading}>Guardar</Button>
                {mensaje && <p className="col-span-2 text-green-600 text-center">{mensaje}</p>}
                {error && <p className="col-span-2 text-red-600 text-center">{error}</p>}
            </form> */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                                <Input placeholder="Nombre" {...field} />
                            </FormControl>
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
                            <FormControl>
                                <Input placeholder="Apellido" {...field} />
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
                                <Input placeholder="Teléfono" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="direccion"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Dirección</FormLabel>
                            <FormControl>
                                <Input placeholder="Dirección" {...field} />
                            </FormControl>
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
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="rol"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Rol</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un rol" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="RECLUTADOR">Reclutador</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="departamento"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Departamento</FormLabel>
                            <FormControl>
                                <Input placeholder="TI, RRHH, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="cargo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cargo</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: Desarrollador" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="col-span-2 mt-4">
                    <Button type="submit" className="w-full" disabled={!isValid || isLoading}>
                        Registrar empleado
                    </Button>
                </div>

                {mensaje && <p className="col-span-2 text-green-600 text-center">{mensaje}</p>}
                {error && <p className="col-span-2 text-red-600 text-center">{error}</p>}
            </form>
        </Form>
    );
}