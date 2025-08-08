"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormCreateEmpleado } from "./CreateFormEmpleado";
// import { FormCreateEmpleado2 } from "./CreateFormEmpleado2";

export function HeaderEmpleados() {
    const [openModalCreate, setOpenModalCreate] = useState(false);

    return (
        <div className="flex justify-between items-center px-4">
            <h2 className="text-2xl">Listado de Empleados</h2>

            <Dialog open={openModalCreate} onOpenChange={setOpenModalCreate}>
                <DialogTrigger asChild>
                    <Button>Agregar Empleado</Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>Nuevo Empleado</DialogTitle>
                        <DialogDescription>
                            Ingrese los datos del nuevo empleado
                        </DialogDescription>
                    </DialogHeader>
                    <FormCreateEmpleado setOpenModalCreate={setOpenModalCreate} />
                    {/* <FormCreateEmpleado2 setOpenModalCreate={setOpenModalCreate} /> */}
                </DialogContent>
            </Dialog>
        </div>
    );
}