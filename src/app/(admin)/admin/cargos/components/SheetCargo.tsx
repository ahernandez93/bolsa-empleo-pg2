import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Pencil } from "lucide-react"
import { FormCreateCargo } from "./FormCreateCargo"
import { useState } from "react"
import { CargoData } from "../components/ListCargos/columns"
import axios from "axios"
import { toast } from "sonner"


interface ListCargosProps {
  cargos: CargoData[]
}


export function SheetCargo({ cargos }: ListCargosProps) {
  const [editingCargo, setEditingCargo] = useState<CargoData | null>(null)
  const [openModalCreate, setOpenModalCreate] = useState(false);

  const handleEdit = async (cargo: CargoData) => {
    try {
      const res = await axios.get(`/api/cargos/${cargo.id}`)
      const cargoCompleto = res.data
      setEditingCargo(cargoCompleto)
      setOpenModalCreate(true)
    } catch (error) {
      console.error("Error al obtener detalles del cargo:", error)
      toast.error("Error al obtener detalles del cargo")
    }
  }
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
        // onClick={() => onEdit(departamento)}
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar Cargo</SheetTitle>
          <SheetDescription>
            Modifique los datos del cargo
          </SheetDescription>
        </SheetHeader>
        {/* <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-3">
            <Label htmlFor="sheet-demo-name">Nombre</Label>
            <Input id="sheet-demo-name" defaultValue="Pedro Duarte" />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="sheet-demo-username">Descripción</Label>
            <Input id="sheet-demo-username" defaultValue="@peduarte" />
          </div>
        </div> */}
        <FormCreateCargo
          initialData={editingCargo}
          setOpenModalCreate={setOpenModalCreate}
          isEditMode={Boolean(editingCargo)}
        />
        <SheetFooter>
          <Button type="submit">Guardar Cambios</Button>
          <SheetClose asChild>
            <Button variant="outline">Cancelar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}