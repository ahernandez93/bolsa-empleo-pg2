import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function FiltersBar({
    query,
    onQuery,
    category,
    onCategory,
    location,
    onLocation,
    modality,
    onModality,
}: {
    query: string; onQuery: (v: string) => void;
    category: string; onCategory: (v: string) => void;
    location: string; onLocation: (v: string) => void;
    modality: string; onModality: (v: string) => void;
}) {
    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                    value={query}
                    onChange={(e) => onQuery(e.target.value)}
                    placeholder="Puesto, empresa o palabra clave"
                    className="pl-9"
                />
            </div>
            {/* Selects */}
            <Select value={category} onValueChange={onCategory}>
                <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Area" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="0">Todas</SelectItem>
                    <SelectItem value="Tecnología">Tecnología</SelectItem>
                    <SelectItem value="Producto">Producto</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                </SelectContent>
            </Select>

            <Select value={location} onValueChange={onLocation}>
                <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Ubicación" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="0">Todas</SelectItem>
                    <SelectItem value="Madrid">San Pedro Sula</SelectItem>
                    <SelectItem value="Barcelona">Choloma</SelectItem>
                    <SelectItem value="Remoto">Puerto Cortes</SelectItem>
                </SelectContent>
            </Select>

            <Select value={modality} onValueChange={onModality}>
                <SelectTrigger className="w-full md:w-44">
                    <SelectValue placeholder="Modalidad" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="0">Todas</SelectItem>
                    <SelectItem value="Remoto">Remoto</SelectItem>
                    <SelectItem value="Presencial">Presencial</SelectItem>
                    <SelectItem value="Híbrido">Híbrido</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
