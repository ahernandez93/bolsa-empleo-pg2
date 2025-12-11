"use client";

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
import { motion } from "framer-motion"
import Image from "next/image";

const schema = z.object({
    email: z.string().email("Correo electrónico inválido"),
});

type FormValues = z.infer<typeof schema>;

export default function RecuperarContrasenaPage() {
    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { email: "" },
    });

    const onSubmit = async (data: FormValues) => {
        try {
            await axios.post("/api/auth/forgot-password", data);
            toast.success(
                "Si el correo está registrado, te enviamos un enlace para restablecer la contraseña."
            );
        } catch (error) {
            console.error(error);
            toast.error("Hubo un problema al procesar la solicitud.");
        }
    };

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full"
                >
                    <Card className="overflow-hidden p-0">
                        <CardContent className="grid p-0 md:grid-cols-2">
                            <div className="p-6 md:p-8 flex flex-col justify-center">
                                <h1 className="mb-2 text-xl font-bold text-center">
                                    Recuperar contraseña
                                </h1>
                                <p className="mb-6 text-sm text-muted-foreground text-center">
                                    Ingresá el correo con el que te registraste. Te enviaremos un
                                    enlace para restablecer tu contraseña.
                                </p>

                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Correo electrónico</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="email"
                                                            placeholder="tucorreo@ejemplo.com"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Button type="submit" className="w-full">
                                            Enviar enlace
                                        </Button>
                                    </form>
                                </Form>

                                <div className="mt-4 text-center text-sm">
                                    <Link href="/admin/login" className="underline underline-offset-4">
                                        Volver al inicio de sesión
                                    </Link>
                                </div>
                            </div>

                            <div className="relative hidden md:block bg-muted">
                                <Image
                                    src="/portada5.jpg"     // 👉 usa la misma imagen del login
                                    alt="Recuperar contraseña"
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
