"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { empleadoSchema, EmpleadoFormData, empleadoUpdateSchema, EmpleadoUpdateData } from "@/lib/schemas/empleadoSchema";
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { EmpleadoCompleto } from "@/types"
import { Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";

type FormCreateProps = {
    setOpenModalCreate: Dispatch<SetStateAction<boolean>>
    initialData?: EmpleadoCompleto | null,
    isEditMode: boolean
}

export function FormCreateDepartamento({ setOpenModalCreate, initialData, isEditMode = false }: FormCreateProps) {

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false)

    const schema = isEditMode ? empleadoUpdateSchema : empleadoSchema;

    const defaultValues = initialData ? {
        nombre: initialData.usuario.persona.nombre,
        apellido: initialData.usuario.persona.apellido,
        telefono: initialData.usuario.persona.telefono || "",
        direccion: initialData.usuario.persona.direccion || "",
        fechaNacimiento: initialData.usuario.persona.fechaNacimiento?.split("T")[0] || "",
        email: initialData.usuario.email,
        password: "",
        rol: initialData.usuario.rol,
        departamento: initialData.departamento,
        cargo: initialData.cargo,
        activo: initialData.usuario?.activo,
    } : {
        nombre: "",
        apellido: "",
        telefono: "",
        direccion: "",
        fechaNacimiento: "",
        email: "",
        password: "",
        rol: undefined,
        departamento: "",
        cargo: "",
        activo: true,
    };
    const form = useForm<EmpleadoFormData | EmpleadoUpdateData>({
        resolver: zodResolver(schema),
        defaultValues: defaultValues,
        mode: "onChange",
        reValidateMode: "onChange",
    });

    const isValid = form.formState.isValid;

    const onSubmit = async (data: EmpleadoFormData | EmpleadoUpdateData) => {
        setError(null);
        setIsLoading(true)

        try {
            if (isEditMode) {
                await axios.put(`/api/empleados/${initialData?.id}`, data)
                toast.success("Empleado actualizado correctamente")
            } else {
                await axios.post("/api/empleados", data)
                toast.success("Empleado creado exitosamente")
            }

            form.reset()
            router.refresh()
            setOpenModalCreate(false)
        } catch (err) {
            setIsLoading(false);
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message);
                toast.error(`Error al crear el empleado: ${err.response?.data?.message ?? "Desconocido"}`);
            } else {
                setError("Error inesperado al crear empleado");
                toast.error("Error inesperado al crear el empleado");
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
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
                    render={({ field }) => {
                        return (
                            <FormItem>
                                <FormLabel>Contraseña {/* {isEditMode && "(dejar en blanco para no cambiar)"} */}</FormLabel>
                                <div className="relative">
                                    <FormControl>
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            {...field}
                                            className="pr-10"
                                            autoComplete="new-password"
                                        />
                                    </FormControl>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </Button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )
                    }}
                />
                <FormField
                    control={form.control}
                    name="rol"
                    render={({ field }) => {
                        return (
                            <FormItem>
                                <FormLabel>Rol</FormLabel>
                                <Select /* key={field.value} */ onValueChange={field.onChange} value={field.value ?? ""}>
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
                        );
                    }}
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

                <FormField
                    control={form.control}
                    name="activo"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Estado</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                    {field.value ? "El usuario está activo" : "El usuario está inactivo"}
                                </p>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="col-span-2 mt-4">
                    <Button type="submit" className="w-full" disabled={!isValid || isLoading}>
                        {isEditMode ? "Guardar cambios" : "Registrar empleado"}
                    </Button>
                </div>

                {error && <p className="col-span-2 text-red-600 text-center">{error}</p>}
            </form>
        </Form>
    );
}