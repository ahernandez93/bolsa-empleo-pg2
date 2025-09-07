"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function HeaderPostulaciones() {
    const [openModalCreate, setOpenModalCreate] = useState(false);

    return (
        <div className="flex justify-between items-center px-4">
            <h2 className="text-2xl">Listado de Postulaciones</h2>

            {/* <Dialog open={openModalCreate} onOpenChange={setOpenModalCreate}>
                <DialogTrigger asChild>
                    <Button>Agregar Postulación</Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>Nueva Postulación</DialogTitle>
                        <DialogDescription>
                            Ingrese los datos de la nueva postulación
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog> */}
        </div>
    );
}