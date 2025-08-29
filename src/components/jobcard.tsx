import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, Briefcase } from "lucide-react";
import type { JobCardProps } from "@/components/jobcarousel";

export default function JobCard({ puesto, area, ubicacionDepartamento, ubicacionCiudad, empresa, tipoTrabajo, modalidad, fechaCreacion }: JobCardProps) {
    return (
        <Card className="h-full border-slate-200 flex flex-col">
            <CardHeader className="pb-0">
                <div className="flex items-center gap-2">
                    {/* <Avatar className="h-8 w-8">
                        <AvatarFallback>{empresa[0]}</AvatarFallback>
                    </Avatar> */}
                    <div className="min-w-0">
                        <CardTitle className="truncate text-lg">{puesto}</CardTitle>
                        <p className="truncate text-xs text-slate-500">{area}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between space-y-3">
                <div className="grid grid-cols-1 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{ubicacionCiudad} - {ubicacionDepartamento}</span>
                    <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{modalidad}</span>
                    <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{tipoTrabajo}</span>
                </div>
                {/* <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="rounded-full">{modality}</Badge>
                    <Badge variant="secondary" className="rounded-full">{contract}</Badge>
                    <Badge variant="secondary" className="rounded-full">{department}</Badge>
                </div> */}
                <div className="flex gap-2 pt-1">
                    <Button className="w-full">Aplicar ahora</Button>
                </div>
                <div className="flex gap-2 pt-1 text-sm text-slate-500 justify-end">
                    <span>Publicada{" "}
                        {formatDistanceToNow(new Date(fechaCreacion), {
                            addSuffix: true,
                            locale: es,
                        })}</span>
                </div>
            </CardContent>
        </Card>
    );
}
