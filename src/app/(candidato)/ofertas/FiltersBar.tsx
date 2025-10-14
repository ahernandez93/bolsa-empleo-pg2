import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Modalidad } from "@prisma/client";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

const MODALITY_LABEL: Record<Modalidad, string> = {
    REMOTO: "Remoto",
    PRESENCIAL: "Presencial",
    HIBRIDO: "Híbrido",
};

const ALL_VALUE = "__all__";

export default function FiltersBar({
    query,
    onQuery,
    category,
    onCategory,
    location,
    onLocation,
    modality,
    onModality,
    areaOptions,
    cityOptions,
    modalityOptions,
}: {
    query: string; onQuery: (v: string) => void;
    category: string; onCategory: (v: string) => void;
    location: string; onLocation: (v: string) => void;
    modality: Modalidad | ""; onModality: (v: Modalidad | "") => void;
    areaOptions: string[];
    cityOptions: string[];
    modalityOptions: Modalidad[];
}) {
    return (
        <Card className="p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Search */}
            <div className="space-y-1.5 flex-1">
                <Label htmlFor="q" className="text-xs text-slate-600">Búsqueda</Label>
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        id="q"
                        value={query}
                        onChange={(e) => onQuery(e.target.value)}
                        placeholder="Puesto, empresa o palabra clave"
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Selects */}
            <div className="space-y-1.5">
                <Label id="lbl-area" className="text-xs text-slate-600">Área</Label>
                <Select value={category || ALL_VALUE} onValueChange={(v) => onCategory(v === ALL_VALUE ? "" : v)}>
                    <SelectTrigger aria-labelledby="lbl-area" className="w-full md:w-44">
                        <SelectValue placeholder="Area" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_VALUE}>Todas</SelectItem>
                        {areaOptions.map((a) => (
                            <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1.5">
                <Label id="lbl-ubicacion" className="text-xs text-slate-600">Ubicación</Label>
                <Select value={location || ALL_VALUE} onValueChange={(v) => onLocation(v === ALL_VALUE ? "" : v)}>
                    <SelectTrigger aria-labelledby="lbl-ubicacion" className="w-full md:w-48">
                        <SelectValue placeholder="Ubicación" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_VALUE}>Todas</SelectItem>
                        {cityOptions.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1.5">
                <Label id="lbl-modalidad" className="text-xs text-slate-600">Modalidad</Label>
                <Select value={modality || ALL_VALUE} onValueChange={(v) => onModality(v === ALL_VALUE ? "" : (v as Modalidad))}>
                    <SelectTrigger aria-labelledby="lbl-modalidad" className="w-full md:w-44">
                        <SelectValue placeholder="Modalidad" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_VALUE}>Todas</SelectItem>
                        {modalityOptions.map((m) => (
                            <SelectItem key={m} value={m}>
                                {MODALITY_LABEL[m]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
        </Card>
    );
}
