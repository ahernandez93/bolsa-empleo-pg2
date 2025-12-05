"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useEmpleadoPerfil } from "@/hooks/use-empleado-perfil";
import PerfilEmpleadoForm from "./perfil-form";

export default function PerfilEmpleadoView() {
    const { perfil, isLoading, isError, mutate } = useEmpleadoPerfil();
    const [edit, setEdit] = useState(false);

    if (isLoading) return <div className="text-sm text-muted-foreground">Cargando perfil…</div>;
    if (isError || !perfil) return <div className="text-sm text-destructive">No se pudo cargar tu perfil.</div>;

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Información</CardTitle>
                    <Badge variant="secondary">{perfil.rol}</Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div><span className="text-muted-foreground text-sm">Nombre:</span> <div className="font-medium">{perfil.nombre} {perfil.apellido}</div></div>
                    <div><span className="text-muted-foreground text-sm">Email:</span> <div className="font-medium">{perfil.email}</div></div>
                    {perfil.empresa && (
                        <div><span className="text-muted-foreground text-sm">Empresa:</span> <div className="font-medium">{perfil.empresa.nombre}</div></div>
                    )}
                    <Separator />
                    <div className="grid grid-cols-2 gap-2">
                        <div><span className="text-muted-foreground text-sm">Teléfono:</span> <div className="font-medium">{perfil.telefono || "—"}</div></div>
                        <div><span className="text-muted-foreground text-sm">Género:</span> <div className="font-medium">{perfil.genero || "—"}</div></div>
                        <div><span className="text-muted-foreground text-sm">Nacimiento:</span> <div className="font-medium">{perfil.fechaNacimiento || "—"}</div></div>
                        <div className="col-span-2"><span className="text-muted-foreground text-sm">Dirección:</span> <div className="font-medium break-words">{perfil.direccion || "—"}</div></div>
                    </div>

                    <div className="pt-2">
                        <Button onClick={() => setEdit(v => !v)}>{edit ? "Cancelar" : "Editar"}</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{edit ? "Editar perfil" : "Acciones"}</CardTitle>
                </CardHeader>
                <CardContent>
                    {edit ? (
                        <PerfilEmpleadoForm initial={perfil} onSaved={() => { setEdit(false); mutate(); }} />
                    ) : (
                        <div className="text-sm text-muted-foreground">Usa el botón “Editar” para actualizar tu información.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
