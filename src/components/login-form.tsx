"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState } from "react"
import { LoginAction } from "@/app/actions/auth-action"
import Link from "next/link"

const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null | undefined>(null);
  const router = useRouter()

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    const res = await LoginAction(data.email, data.password);

    console.log(res);
    if (res.success) {
      toast.success("Inicio de sesión exitoso");
      router.push("/admin");
      router.refresh();
    } else {
      setError(res.error);
      toast.error("Error al iniciar sesión");
      form.reset();
    }
    setIsLoading(false);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Bienvenido</h1>
                  <p className="text-muted-foreground text-balance">
                    Inicia sesión para continuar
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="m@example.com"
                          {...field}
                        />
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
                      <div className="flex items-center">
                        <FormLabel>Contraseña</FormLabel>
                        <Link
                          href="/admin/recuperar-contrasena"
                          className="ml-auto text-sm underline-offset-2 hover:underline"
                        >
                          ¿Olvidaste tu contraseña?
                        </Link>
                      </div>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  Iniciar Sesión
                </Button>

                {error && (
                  <p className="text-red-500 text-center mt-2">
                    {error}
                  </p>
                )}

                <div className="text-center text-sm">
                  ¿No tienes una cuenta?{" "}
                  <Link href="/admin/registro" className="underline underline-offset-4">
                    Regístrate
                  </Link>
                </div>
              </div>
            </form>
          </Form>

          <div className="bg-muted relative hidden md:block">
            <Image
              src="/portada5.jpg"
              alt="Portada Login"
              width={100}
              height={100}
              quality={100}
              priority={true}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
