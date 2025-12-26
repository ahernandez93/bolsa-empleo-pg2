"use client";

import useSWR from "swr";
import axios from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import JobCard from "@/components/jobcard";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { JobCardProps } from "@/components/jobcarousel";
import { useSession } from "next-auth/react";

const filtersSchema = z.object({
    q: z.string().optional().default(""),
    order: z.enum(["recientes", "empresa", "ciudad"]).default("recientes"),
});
type FiltersIn = z.input<typeof filtersSchema>;   // { q?: string; order?: ... } <- input (puede venir undefined)

const fetcher = async (url: string) => {
    const { data } = await axios.get(url);
    return data.items as JobCardProps[];
};

export default function GuardadosClient() {
    const form = useForm<FiltersIn>({
        resolver: zodResolver(filtersSchema),
        defaultValues: { q: "", order: "recientes" },
    });

    const { status } = useSession();

    const q = form.watch("q") ?? "";
    const order = form.watch("order") ?? "recientes";

    const qs = useMemo(() => {
        const p = new URLSearchParams();
        if (q) p.set("q", q);
        if (order) p.set("order", order);
        return p.toString();
    }, [q, order]);

    const base = "/api/guardados/lista";
    const url = qs ? `${base}?${qs}` : base;

    const swrKey = status === "authenticated" ? url : null;

    const { data, isLoading, mutate } = useSWR(swrKey, fetcher, {
        keepPreviousData: true,
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <main className="mx-auto max-w-6xl px-4 py-6">
                <div className="flex items-end justify-between gap-3">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold">Guardados</h1>
                        <p className="text-sm text-muted-foreground">Tus vacantes favoritas en un solo lugar.</p>
                    </div>
                </div>

                {/* Toolbar */}
                <Card className="p-3">
                    <div className="grid items-center gap-3 sm:grid-cols-[1fr_200px]">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Buscar por puesto, empresa o ciudad"
                                value={q}
                                onChange={(e) => form.setValue("q", e.target.value)}
                            />
                            <Button variant="secondary" onClick={() => form.reset({ q: "", order })}>
                                Limpiar
                            </Button>
                        </div>
                        <div className="flex justify-end">
                            <Select value={order} onValueChange={(v) => form.setValue("order", v as FiltersIn["order"])}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Ordenar por" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="recientes">Guardado más reciente</SelectItem>
                                    <SelectItem value="empresa">Empresa (A–Z)</SelectItem>
                                    <SelectItem value="ciudad">Ciudad (A–Z)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>

                <Separator />

                {/* Grid */}
                {isLoading ? (
                    <div className="grid gap-4 py-2 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="p-4">
                                <Skeleton className="h-5 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2 mb-4" />
                                <Skeleton className="h-20 w-full" />
                            </Card>
                        ))}
                    </div>
                ) : data && data.length > 0 ? (
                    <div className="grid gap-4 py-2 sm:grid-cols-2 lg:grid-cols-3">
                        {data.map((job) => (
                            <JobCard
                                key={job.id}
                                {...job}
                                onToggleSaved={(next: boolean) => {
                                    if (!next) {
                                        mutate((prev) => (prev ?? []).filter((x) => x.id !== job.id), { revalidate: false });
                                    }
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
                        No tenés ofertas guardadas. Explora el catálogo y toca el ícono de guardar en las ofertas que te interesen.
                    </div>
                )}
            </main>
        </div>
    );
}
