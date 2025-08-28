"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormCreateOferta } from "./FormCreateOferta";

export function HeaderOfertasLaborales() {
    const [openModalCreate, setOpenModalCreate] = useState(false);

    return (
        <div className="flex justify-between items-center px-4">
            <h2 className="text-2xl">Listado de Ofertas Laborales</h2>

            <Dialog open={openModalCreate} onOpenChange={setOpenModalCreate}>
                <DialogTrigger asChild>
                    <Button>Agregar Oferta Laboral</Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>Nueva Oferta Laboral</DialogTitle>
                        <DialogDescription>
                            Ingrese los datos de la nueva oferta laboral
                        </DialogDescription>
                    </DialogHeader>
                    <FormCreateOferta
                        setOpenModalCreate={setOpenModalCreate}
                        isEditMode={false}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}