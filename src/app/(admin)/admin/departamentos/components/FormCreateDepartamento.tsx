"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { departamentoSchema } from "@/lib/schemas/departamentoSchema";
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { DepartamentoCompleto } from "@/types"
import { Switch } from "@/components/ui/switch";
import z from "zod";

type FormCreateProps = {
    setOpenModalCreate: Dispatch<SetStateAction<boolean>>
    initialData?: DepartamentoCompleto | null,
    isEditMode: boolean
}

export function FormCreateDepartamento({ setOpenModalCreate, initialData, isEditMode = false }: FormCreateProps) {

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // const schema = isEditMode ? empleadoUpdateSchema : empleadoSchema;

    const defaultValues = initialData ? {
        descripcion: initialData.descripcion,
        habilitado: initialData.habilitado ?? true,
    } : {
        descripcion: "",
        habilitado: true,
    };

    type DepartamentoFormInput = z.input<typeof departamentoSchema>;
    const form = useForm<DepartamentoFormInput>({
        resolver: zodResolver(departamentoSchema),
        defaultValues: defaultValues,
        mode: "onChange",
        reValidateMode: "onChange",
    });

    const isValid = form.formState.isValid;

    const onSubmit = async (data: DepartamentoFormInput) => {
        setError(null);
        setIsLoading(true)

        try {
            if (isEditMode) {
                await axios.put(`/api/departamentos/${initialData?.id}`, data)
                toast.success("Departamento actualizado correctamente")
            } else {
                await axios.post("/api/departamentos", data)
                toast.success("Departamento creado exitosamente")
            }

            form.reset()
            router.refresh()
            setOpenModalCreate(false)
        } catch (err) {
            setIsLoading(false);
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message);
                toast.error(`Error al crear el departamento: ${err.response?.data?.message ?? "Desconocido"}`);
            } else {
                setError("Error inesperado al crear departamento");
                toast.error("Error inesperado al crear el departamento");
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
                    name="descripcion"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                                <Input placeholder="Descripción" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="habilitado"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Habilitado</FormLabel>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="col-span-2 mt-4">
                    <Button type="submit" className="w-full" disabled={!isValid || isLoading}>
                        {isEditMode ? "Guardar cambios" : "Registrar departamento"}
                    </Button>
                </div>

                {error && <p className="col-span-2 text-red-600 text-center">{error}</p>}
            </form>
        </Form>
    );
}