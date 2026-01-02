"use client";

import useSWR from "swr";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DateRangePicker from "@/components/dashboardadmin/date-range-picker";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { useMemo, useState } from "react";
import Link from "next/link";
import { usePlanActual } from "@/hooks/use-plan-actual";
import BadgePlan from "@/components/planes/badge-plan";
import BannerExpiracion from "@/components/planes/banner-expiracion";

const fetcher = (url: string) => axios.get(url).then(r => r.data);

function Metric({ label, value }: { label: string; value: string | number }) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="text-2xl font-semibold">{value}</div>
            </CardContent>
        </Card>
    );
}

function BreakdownList({ title, items, total }: { title: string; items: Record<string, number>; total: number }) {
    const entries = Object.entries(items);
    return (
        <Card>
            <CardContent className="p-4">
                <div className="mb-2 text-sm font-medium">{title}</div>
                <div className="space-y-2">
                    {entries.length === 0 ? (
                        <div className="text-sm text-muted-foreground">Sin datos</div>
                    ) : entries.map(([k, v]) => {
                        const pct = total ? Math.round((v / total) * 100) : 0;
                        return (
                            <div key={k} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span>{k}</span><span className="tabular-nums">{v} <span className="text-muted-foreground">({pct}%)</span></span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-slate-200">
                                    <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

export default function DashboardAdmin() {
    const { plan, meta, rol } = usePlanActual();
    const isSuperAdmin = rol === "SUPERADMIN";
    const isAdmin = rol === "ADMIN";

    const [empresaFiltro, setEmpresaFiltro] = useState<"all" | string>("all");
    const { data: empresas, isLoading: loadingEmpresas } = useSWR(
        isSuperAdmin ? "/api/superadmin/empresas" : null,
        fetcher,
    );
    const [range, setRange] = useState<{ from: Date; to: Date }>(() => {
        const to = new Date();
        const from = addDays(to, -30);
        return { from, to };
    });

    const qs = useMemo(() => {
        const p = new URLSearchParams();
        if (range?.from) p.set("from", range.from.toISOString());
        if (range?.to) p.set("to", range.to.toISOString());
        if (isSuperAdmin && empresaFiltro !== "all") {
            p.set("empresaId", empresaFiltro);
        }
        return p.toString();
    }, [range, isSuperAdmin, empresaFiltro]);

    const url = qs ? `/api/admin/dashboard?${qs}` : "/api/admin/dashboard";
    const { data, isLoading } = useSWR(url, fetcher, { revalidateOnFocus: true });

    return (
        <div className="flex flex-col gap-4">
            {/* Header del plan */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                {/* Lado izquierdo: según rol */}
                {!isSuperAdmin ? (
                    // Vista normal empresa
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Plan actual:</span>
                        <BadgePlan nombre={plan?.nombre ?? null} />
                        {meta && (plan?.nombre !== "Premium") ? (
                            <span className="text-xs text-muted-foreground">
                                • {meta.ofertasActivas}/{plan?.maxOfertasActivas ?? 0} ofertas activas
                                {typeof meta.restantes === "number" ? ` • ${meta.restantes} restantes` : null}
                            </span>
                        ) : (
                            <span className="text-xs text-muted-foreground">
                                Ofertas ilimitadas
                            </span>
                        )}
                    </div>
                ) : (
                    // Vista SUPERADMIN
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="uppercase text-[10px] tracking-wide">
                                Superadmin
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                {empresaFiltro === "all"
                                    ? "Viendo todas las empresas"
                                    : `Filtrando por empresa`}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Empresa:</span>
                            <div className="w-[260px]">
                                <Select
                                    value={empresaFiltro}
                                    onValueChange={(value) => setEmpresaFiltro(value as "all" | string)}
                                >
                                    <SelectTrigger className="h-8">
                                        <SelectValue
                                            placeholder={
                                                loadingEmpresas
                                                    ? "Cargando empresas..."
                                                    : "Selecciona una empresa"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las empresas</SelectItem>
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {empresas?.map((e: any) => (
                                            <SelectItem key={e.id} value={e.id}>
                                                {e.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lado derecho: botón de cambiar plan solo para empresa normal */}
                {isAdmin && (
                    <Link href="/admin/planes">
                        <Button variant="secondary" size="sm">
                            Cambiar plan
                        </Button>
                    </Link>
                )}
            </div>

            {/* Banner de expiración */}
            {meta && !isSuperAdmin && (
                <BannerExpiracion
                    diasParaVencer={meta.diasParaVencer}
                    vencePronto={meta.vencePronto}
                    expirada={meta.expirada}
                />
            )}
            {/* Toolbar: rango + acciones rápidas */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                    <DateRangePicker
                        value={{ from: range.from, to: range.to }}
                        onChange={(r) => {
                            if (!r?.from) return;
                            setRange({ from: r.from, to: r.to ?? r.from });
                        }}
                    />
                    <Button variant="secondary" onClick={() => {
                        const to = new Date(); const from = addDays(to, -30);
                        setRange({ from, to });
                    }}>
                        Últimos 30 días
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {/* {(rol === "ADMIN" || rol === "RECLUTADOR") && ( */}
                    <Link href="/admin/ofertaslaborales"><Button>Crear oferta</Button></Link>
                    {/* )} */}
                    <Link href="/admin/postulaciones-recibidas"><Button>Revisar postulaciones</Button></Link>
                </div>
            </div>

            <Separator />

            {isLoading || !data ? (
                <div className="text-sm text-muted-foreground p-2">Cargando panel…</div>
            ) : (
                <>
                    {/* KPIs */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Metric label="Ofertas (rango)" value={data.kpis.totalOfertas} />
                        <Metric label="Postulaciones (rango)" value={data.kpis.totalPostulaciones} />
                        <Metric label="Ofertas abiertas" value={data.kpis.ofertasAbiertas} />
                        <Metric label="Tasa de avance" value={`${Math.round(data.kpis.tasaAvance * 100)}%`} />
                    </div>

                    {/* Desgloses */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <BreakdownList title="Ofertas por estado" items={data.breakdowns.ofertasPorEstado} total={data.kpis.totalOfertas} />
                        <BreakdownList title="Postulaciones por estado" items={data.breakdowns.postulacionesPorEstado} total={data.kpis.totalPostulaciones} />
                    </div>

                    {/* Top ciudades */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="mb-2 text-sm font-medium">Top ciudades por ofertas</div>
                            {data.topCiudades.length === 0 ? (
                                <div className="text-sm text-muted-foreground">Sin datos</div>
                            ) : (
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {/*eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
                                    {data.topCiudades.map((c: any) => (
                                        <div key={c.id} className="rounded-lg border p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-medium">{c.nombre}</div>
                                                <Badge variant="secondary">{c.count}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Alertas */}
                    {data.alerts.ofertasSinPostulaciones14d.length > 0 && (
                        <Card>
                            <CardContent className="p-4">
                                <div className="mb-2 text-sm font-medium">Alertas</div>
                                <ul className="space-y-2">
                                    {/*eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
                                    {data.alerts.ofertasSinPostulaciones14d.map((o: any) => (
                                        <li key={o.id} className="text-sm">
                                            <span className="font-medium">{o.puesto}</span> — {o.empresa?.nombre} <span className="text-muted-foreground">
                                                (sin postulaciones en 14 días; creada {format(new Date(o.fechaCreacion), "dd MMM yyyy", { locale: es })})
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Actividad reciente */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardContent className="p-4">
                                <div className="mb-2 text-sm font-medium">Últimas ofertas</div>
                                <ul className="space-y-2 text-sm">
                                    {/*eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
                                    {data.actividad.ultimasOfertas.map((o: any) => (
                                        <li key={o.id} className="flex items-center justify-between">
                                            <span className="truncate">{o.puesto} — <span className="text-muted-foreground">{o.empresa?.nombre}</span></span>
                                            <span className="text-muted-foreground">{format(new Date(o.fechaCreacion), "dd MMM", { locale: es })}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="mb-2 text-sm font-medium">Últimas postulaciones</div>
                                <ul className="space-y-2 text-sm">
                                    {/*eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
                                    {data.actividad.ultimasPostulaciones.map((p: any) => (
                                        <li key={p.id} className="flex items-center justify-between">
                                            <span className="truncate">{p.oferta.puesto} — <span className="text-muted-foreground">{p.oferta.empresa?.nombre}</span></span>
                                            <Badge>{p.estado}</Badge>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Rango mostrado */}
                    <div className="text-xs text-muted-foreground">
                        Rango: {format(new Date(range.from), "dd MMM yyyy", { locale: es })} — {format(new Date(range.to), "dd MMM yyyy", { locale: es })}
                    </div>
                </>
            )}
        </div>
    );
}
