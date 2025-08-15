"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormCreateDepartamento } from "./FormCreateDepartamento";

export function HeaderDepartamentos() {
    const [openModalCreate, setOpenModalCreate] = useState(false);

    return (
        <div className="flex justify-between items-center px-4">
            <h2 className="text-2xl">Listado de Departamentos</h2>

            <Dialog open={openModalCreate} onOpenChange={setOpenModalCreate}>
                <DialogTrigger asChild>
                    <Button>Agregar Departamento</Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>Nuevo Departamento</DialogTitle>
                        <DialogDescription>
                            Ingrese los datos del nuevo departamento
                        </DialogDescription>
                    </DialogHeader>
                    <FormCreateDepartamento setOpenModalCreate={setOpenModalCreate} isEditMode={false} />
                </DialogContent>
            </Dialog>
        </div>
    );
}