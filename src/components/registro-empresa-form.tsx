// src/app/(auth)/registro-empresa/RegistroEmpresaForm.tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { registroEmpresaSchema, type RegistroEmpresaValues } from "@/lib/schemas/registroEmpresaSchema"
import { RegisterCompanyAdminAction } from "@/app/actions/auth-action"
import { signIn } from "next-auth/react"

export function RegistroEmpresaForm({ className, ...props }: React.ComponentProps<"div">) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)


    const form = useForm<RegistroEmpresaValues>({
        resolver: zodResolver(registroEmpresaSchema),
        defaultValues: {
            usuario: { nombre: "", apellido: "", email: "", password: "" },
            empresa: {
                nombre: "",
                telefono: "",
                sitioWeb: "",
                descripcion: "",
                ubicacionDepartamentoId: undefined,
                ubicacionCiudadId: undefined,
            },
            planNombre: "Gratis",
        },
        mode: "onChange",
    })

    const onSubmit = async (data: RegistroEmpresaValues) => {
        setIsLoading(true)
        const res = await RegisterCompanyAdminAction(data)

        if (res.success) {
            toast.success("Registro exitoso. Iniciando sesión...")
            const login = await signIn("credentials", {
                email: data.usuario.email,
                password: data.usuario.password,
                redirect: false,
            })
            if (login?.error) {
                setError(login.error)
                toast.error(login.error)
            }
            router.push("/admin")
            router.refresh()
        } else {
            setError(res.error ?? "Error al registrar")
            toast.error(res.error ?? "Error al registrar")
        }
        setIsLoading(false)
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col items-center text-center">
                                    <h1 className="text-2xl font-bold">Crear cuenta de empresa</h1>
                                    <p className="text-muted-foreground text-balance">
                                        Registra tu empresa y el usuario administrador
                                    </p>
                                </div>

                                {/* DATOS DEL ADMIN (USUARIO) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="usuario.nombre"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nombre</FormLabel>
                                                <FormControl><Input placeholder="Juan" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="usuario.apellido"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Apellido</FormLabel>
                                                <FormControl><Input placeholder="Pérez" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="usuario.email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Correo electrónico</FormLabel>
                                            <FormControl><Input type="email" placeholder="admin@empresa.com" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="usuario.password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contraseña</FormLabel>
                                            <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* DATOS DE LA EMPRESA */}
                                <FormField
                                    control={form.control}
                                    name="empresa.nombre"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre de la empresa</FormLabel>
                                            <FormControl><Input placeholder="Mi Empresa S.A." {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="empresa.telefono"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Teléfono</FormLabel>
                                                <FormControl><Input placeholder="+504 9999-9999" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="empresa.sitioWeb"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sitio web</FormLabel>
                                                <FormControl><Input placeholder="https://empresa.com" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <input type="hidden" {...form.register("planNombre")} value="Gratis" />

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "Creando..." : "Crear empresa y admin"}
                                </Button>

                                {error && (
                                    <p className="text-red-500 text-center mt-2">{error}</p>
                                )}

                                <div className="text-center text-sm">
                                    ¿Ya tienes cuenta?{" "}
                                    <a href="/admin/login" className="underline underline-offset-4">
                                        Inicia sesión
                                    </a>
                                </div>
                            </div>
                        </form>
                    </Form>

                    <div className="bg-muted relative hidden md:block">
                        <Image
                            src="/portada5.jpg"
                            alt="Portada Registro"
                            width={100}
                            height={100}
                            quality={100}
                            priority
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
