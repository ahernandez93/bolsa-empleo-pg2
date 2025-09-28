"use client";

import { useState } from "react";
import { useEmpresaConfig } from "@/hooks/use-empresa-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import EmpresaConfigForm from "./empresa-form";

export default function EmpresaConfigView() {
    const { empresa, isLoading, isError, mutate } = useEmpresaConfig();
    const [edit, setEdit] = useState(false);

    if (isLoading) return <div className="text-sm text-muted-foreground">Cargando…</div>;
    if (isError || !empresa) return <div className="text-sm text-destructive">No se pudo cargar la empresa.</div>;

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Datos de la empresa</CardTitle>
                    <Badge variant={empresa.activa ? "secondary" : "destructive"}>
                        {empresa.activa ? "Activa" : "Inactiva"}
                    </Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div><span className="text-muted-foreground text-sm">Nombre:</span> <div className="font-medium break-words">{empresa.nombre}</div></div>
                    <div><span className="text-muted-foreground text-sm">RTN:</span> <div className="font-medium break-words">{empresa.rtn || "—"}</div></div>
                    <div><span className="text-muted-foreground text-sm">Teléfono:</span> <div className="font-medium break-words">{empresa.telefono || "—"}</div></div>
                    <div><span className="text-muted-foreground text-sm">Sitio web:</span> <div className="font-medium break-words">{empresa.sitioWeb || "—"}</div></div>
                    <div><span className="text-muted-foreground text-sm">Descripción:</span> <div className="font-medium break-words">{empresa.descripcion || "—"}</div></div>
                    <Separator />
                    <div>
                        <span className="text-muted-foreground text-sm">Plan:</span>{" "}
                        {empresa.plan ? (
                            <div className="font-medium flex items-center gap-2">
                                <Badge>{empresa.plan.nombre}</Badge>
                                <span className="text-xs text-muted-foreground">
                                    Límite: {empresa.plan.maxOfertasActivas} | Destacado: {empresa.plan.incluyeDestacado ? "Sí" : "No"}
                                </span>
                            </div>
                        ) : (
                            <div className="font-medium">—</div>
                        )}
                    </div>
                    <div className="pt-2">
                        <Button onClick={() => setEdit(v => !v)}>{edit ? "Cancelar" : "Editar"}</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{edit ? "Editar empresa" : "Acciones"}</CardTitle>
                </CardHeader>
                <CardContent>
                    {edit ? (
                        <EmpresaConfigForm initial={empresa} onSaved={() => { setEdit(false); mutate(); }} />
                    ) : (
                        <div className="text-sm text-muted-foreground">Pulsa “Editar” para actualizar la información de tu empresa.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
