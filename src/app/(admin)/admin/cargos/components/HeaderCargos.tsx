"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormCreateCargo } from "./FormCreateCargo";

export function HeaderCargos() {
    const [openModalCreate, setOpenModalCreate] = useState(false);

    return (
        <div className="flex justify-between items-center px-4">
            <h2 className="text-2xl">Listado de Cargos</h2>

            <Dialog open={openModalCreate} onOpenChange={setOpenModalCreate}>
                <DialogTrigger asChild>
                    <Button>Agregar Cargo</Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>Nuevo Cargo</DialogTitle>
                        <DialogDescription>
                            Ingrese los datos del nuevo cargo
                        </DialogDescription>
                    </DialogHeader>
                    <FormCreateCargo setOpenModalCreate={setOpenModalCreate} isEditMode={false} />
                </DialogContent>
            </Dialog>
        </div>
    );
}