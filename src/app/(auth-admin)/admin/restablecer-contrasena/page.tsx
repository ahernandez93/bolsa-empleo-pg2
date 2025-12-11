"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

const schema = z
    .object({
        password: z
            .string()
            .min(8, "La contraseña debe tener al menos 8 caracteres"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    });

type FormValues = z.infer<typeof schema>;

export default function RestablecerContrasenaPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    if (!token) {
        return (
            <div className="bg-muted flex min-h-svh items-center justify-center p-6">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <p className="mb-4 text-sm">
                            El enlace para restablecer la contraseña no es válido.
                        </p>
                        <Link
                            href="/admin/recuperar-contrasena"
                            className="underline underline-offset-4 text-sm"
                        >
                            Solicitar un nuevo enlace
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const onSubmit = async (data: FormValues) => {
        try {
            const res = await axios.post("/api/auth/reset-password", {
                token,
                password: data.password,
            });

            if (res.data.ok) {
                toast.success("Contraseña actualizada correctamente. Iniciá sesión.");
                router.push("/admin/login");
            } else {
                toast.error(res.data.message || "No se pudo actualizar la contraseña.");
            }
            //eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error(error);
            const msg =
                error?.response?.data?.message ||
                "Error al intentar restablecer la contraseña.";
            toast.error(msg);
        }
    };

    return (
        <div className="bg-muted flex min-h-svh items-center justify-center p-6">
            <div className="w-full max-w-sm md:max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full"
                >
                    <Card className="overflow-hidden p-0">
                        <CardContent className="grid p-0 md:grid-cols-2">
                            <div className="p-6 md:p-8">
                                <h1 className="mb-2 text-xl font-bold text-center">
                                    Restablecer contraseña
                                </h1>
                                <p className="mb-6 text-sm text-muted-foreground text-center">
                                    Escribí tu nueva contraseña.
                                </p>

                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nueva contraseña</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Confirmar contraseña</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Button type="submit" className="w-full">
                                            Guardar nueva contraseña
                                        </Button>
                                    </form>
                                </Form>

                                <div className="mt-4 text-center text-sm">
                                    <Link href="/admin/login" className="underline underline-offset-4">
                                        Ir al inicio de sesión
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-muted relative hidden md:block">
                                <Image
                                    src="/portada5.jpg"
                                    alt="Portada Recuperar Contraseña"
                                    width={100}
                                    height={100}
                                    quality={100}
                                    priority={true}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
