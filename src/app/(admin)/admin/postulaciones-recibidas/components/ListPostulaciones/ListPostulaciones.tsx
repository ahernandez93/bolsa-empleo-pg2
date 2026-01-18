"use client"

import { DataTable } from "./data-table"
import { getColumns, PostulacionConDatos } from "./columns"
import { useState } from "react"
import axios from "axios"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { InitialDataUpdatePostulacion } from "@/types"
import { FormEditPostulacion } from "../FormCreatePostulacion"
import useSWR from "swr"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface ListPostulacionesProps {
    postulaciones: PostulacionConDatos[]
}

const formatDate = (date?: string | Date | null) => {
    if (!date) return "—"
    return format(new Date(date), "dd/MM/yyyy", { locale: es })
}

const formatYearRange = (
    inicio?: string | Date | null,
    fin?: string | Date | null
) => {
    if (!inicio) return "—"

    const startYear = new Date(inicio).getFullYear()

    if (!fin) {
        return `${startYear} - En curso`
    }

    const endYear = new Date(fin).getFullYear()

    return `${startYear} - ${endYear}`
}

export function ListPostulaciones({ postulaciones }: ListPostulacionesProps) {
    const [editingPostulacion, setEditingPostulacion] = useState<InitialDataUpdatePostulacion>({
        id: "",
        estado: "SOLICITUD",
        notasInternas: "",
        historial: [],
        fechaPostulacion: "",
        ofertaPuesto: "",
        candidatoNombre: "",
        candidatoEmail: "",

    })
    const [openModalEdit, setOpenModalEdit] = useState(false);
    const router = useRouter()

    const handleEdit = async (postulacion: PostulacionConDatos) => {
        try {
            const res = await axios.get(`/api/postulaciones/${postulacion.id}`)
            const postulacionCompleta = res.data
            setEditingPostulacion(postulacionCompleta)
            setOpenModalEdit(true)
        } catch (error) {
            console.error("Error al obtener detalles del empleado:", error)
            toast.error("Error al obtener detalles del empleado")
        }
    }

    const handleDelete = async (postulacion: PostulacionConDatos) => {
        const executeDelete = async () => {
            try {
                await axios.delete(`/api/postulaciones/${postulacion.id}`);
                toast.success("Postulación eliminada correctamente");
                router.refresh();
            } catch (error) {
                console.error("Error al eliminar la postulación:", error);
                toast.error("Hubo un error al eliminar la postulación");
            }
        }

        toast(`¿Eliminar a ${postulacion.perfilUsuarioNombre}?`, {
            description: "Esta acción no se puede deshacer",
            action: {
                label: "Eliminar",
                onClick: executeDelete,
            },
            cancel: {
                label: "Cancelar",
                onClick: () => {
                    toast.info("Eliminación cancelada")
                }
            },
            duration: 10000,
        })
    }

    const [openSheet, setOpenSheet] = useState(false)
    const [selectedPostulacionId, setSelectedPostulacionId] = useState<string | null>(null)

    const fetcher = (url: string) => axios.get(url).then(r => r.data)

    const { data: sheetData, isLoading: sheetLoading } = useSWR(
        selectedPostulacionId ? `/api/postulaciones/${selectedPostulacionId}/sheet` : null,
        fetcher
    )

    const handleOpenSheet = (postulacionId: string) => {
        setSelectedPostulacionId(postulacionId)
        setOpenSheet(true)
    }

    const columns = getColumns({ onEdit: handleEdit, onDelete: handleDelete, onOpenSheet: handleOpenSheet })

    const docs = sheetData?.documentos ?? []
    const total = docs.length
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completos = docs.filter((d: any) => d.subido).length

    return (
        <>
            <DataTable columns={columns} data={postulaciones} />

            <Dialog open={openModalEdit} onOpenChange={setOpenModalEdit}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPostulacion ? "Editar Postulación" : "Nueva Postulación"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingPostulacion ? "Actualice los datos de la postulación" : "Ingrese los datos de la nueva postulación"}
                        </DialogDescription>
                    </DialogHeader>
                    <FormEditPostulacion
                        initialData={editingPostulacion}
                        setOpenModalEdit={setOpenModalEdit}
                    />
                </DialogContent>
            </Dialog>

            <Sheet open={openSheet} onOpenChange={setOpenSheet}>
                <SheetContent side="right" className="w-full sm:max-w-6xl overflow-y-auto px-6 py-6">
                    <SheetHeader>
                        <SheetTitle>Perfil del candidato</SheetTitle>
                        <SheetDescription>
                            Información general, experiencia, formación y archivos.
                        </SheetDescription>
                    </SheetHeader>

                    <Separator className="my-4" />

                    {sheetLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-6 w-2/3" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ) : sheetData ? (
                        <div className="space-y-6">
                            {/* 1) INFO GENERAL */}
                            <div className="rounded-lg border p-4 space-y-3">
                                <div className="text-sm font-semibold tracking-wide">DATOS PERSONALES</div>
                                <div className="grid grid-cols-2 gap-6 text-sm">
                                    <div className="text-muted-foreground">Nombre</div>
                                    <div className="font-medium">{sheetData.candidato?.nombreCompleto ?? "—"}</div>

                                    <div className="text-muted-foreground">Correo</div>
                                    <div className="font-medium">{sheetData.candidato?.email ?? "—"}</div>

                                    <div className="text-muted-foreground">Teléfono</div>
                                    <div className="font-medium">{sheetData.candidato?.telefono ?? "—"}</div>

                                    <div className="text-muted-foreground">Ubicación</div>
                                    <div className="font-medium">{sheetData.candidato?.ubicacion ?? "—"}</div>

                                    <div className="text-muted-foreground">Aplicado en</div>
                                    <div className="font-medium">{formatDate(sheetData.postulacion?.fechaPostulacion) ?? "—"}</div>

                                    <div className="text-muted-foreground">Estado</div>
                                    <div className="font-medium">{sheetData.postulacion?.estado ?? "—"}</div>

                                    {sheetData.postulacion?.estado === "CONTRATACION" && (
                                        <>
                                            <div className="text-muted-foreground">Reporte de Documentación</div>
                                            <div className="font-medium">
                                                <a
                                                    href={`/admin/postulaciones-recibidas/${sheetData.postulacion.id}/reporte`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="underline underline-offset-4"
                                                >
                                                    Ver Reporte
                                                </a>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* 2) EXPERIENCIA */}
                            <div className="rounded-lg border p-4 space-y-3">
                                <div className="text-sm font-semibold tracking-wide">EXPERIENCIA LABORAL</div>
                                {sheetData.experiencia?.length ? (
                                    <div className="space-y-3">
                                        {/*eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
                                        {sheetData.experiencia.map((x: any) => (
                                            <div key={x.id} className="text-sm">
                                                <div className="font-semibold">{x.puesto} — {x.empresa}</div>
                                                <div className="text-muted-foreground">{formatDate(x.fechaInicio)} - {x.fechaFin ? formatDate(x.fechaFin) : "Actual"}</div>
                                                {x.descripcion ? <div className="mt-1">{x.descripcion}</div> : null}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground">No hay experiencia registrada.</div>
                                )}
                            </div>

                            {/* 3) EDUCACIÓN */}
                            <div className="rounded-lg border p-4 space-y-3">
                                <div className="text-sm font-semibold tracking-wide">INFORMACIÓN ACADÉMICA</div>
                                {sheetData.educacion?.length ? (
                                    <div className="space-y-3">
                                        {/*eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
                                        {sheetData.educacion.map((x: any) => (
                                            <div key={x.id} className="text-sm">
                                                <div className="font-semibold">{x.institucion}</div>
                                                <div>{x.titulo}</div>
                                                <div className="text-muted-foreground">{formatYearRange(x.fechaInicio, x.fechaFin)}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground">No hay formación registrada.</div>
                                )}
                            </div>

                            {/* 4) TABS */}
                            <Tabs defaultValue="cv" className="w-full">
                                <TabsList className="w-full">
                                    <TabsTrigger value="cv" className="flex-1">Currículum</TabsTrigger>
                                    <TabsTrigger value="docs" className="flex-1">Documentación</TabsTrigger>
                                </TabsList>

                                <TabsContent value="cv" className="mt-4">
                                    {!sheetData.cvUrl ? (
                                        <div className="text-sm text-muted-foreground">No hay CV disponible.</div>
                                    ) : (
                                        <div className="rounded-lg border overflow-hidden">
                                            <iframe title="CV" src={sheetData.cvUrl} className="w-full h-[70vh]" />
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="docs" className="mt-4">
                                    <div className="space-y-3">
                                        <div className="text-sm text-muted-foreground">
                                            Documentación: <span className="font-medium">{completos}/{total}</span> completados
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {/*eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {docs.map((d: any) => {
                                                const isUploaded = d.subido && d.url

                                                return (
                                                    <div
                                                        key={d.tipoId}
                                                        className={cn(
                                                            "rounded-xl border p-4 space-y-2 transition",
                                                            isUploaded
                                                                ? "border-emerald-500/40 bg-emerald-500/5"
                                                                : "border-red-500/40 bg-red-500/5"
                                                        )}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="space-y-1">
                                                                <div className="font-semibold text-sm">{d.nombre}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    Estado: {isUploaded ? "SUBIDO" : "PENDIENTE"}
                                                                </div>

                                                                {d.requerido ? (
                                                                    <Badge variant={isUploaded ? "secondary" : "destructive"}>
                                                                        {isUploaded ? "Completo" : "Requerido"}
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="outline">
                                                                        {isUploaded ? "Completo" : "Opcional"}
                                                                    </Badge>
                                                                )}

                                                                {d.ayuda ? (
                                                                    <div className="text-xs text-muted-foreground">{d.ayuda}</div>
                                                                ) : null}
                                                            </div>

                                                            <span
                                                                className={cn(
                                                                    "h-3 w-3 rounded-full mt-1",
                                                                    isUploaded ? "bg-emerald-500" : "bg-red-500"
                                                                )}
                                                            />
                                                        </div>

                                                        <Button
                                                            asChild={Boolean(isUploaded)}
                                                            size="sm"
                                                            className="w-full"
                                                            variant={isUploaded ? "secondary" : "outline"}
                                                            disabled={!isUploaded}
                                                        >
                                                            {isUploaded ? (
                                                                <a href={d.url} target="_blank" rel="noreferrer">
                                                                    Ver
                                                                </a>
                                                            ) : (
                                                                <span>Falta subir</span>
                                                            )}
                                                        </Button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground">
                            No se encontró información.
                        </div>
                    )}
                </SheetContent>
            </Sheet>

        </>
    )
}
