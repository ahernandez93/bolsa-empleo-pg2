"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";

type Props = {
    value: DateRange | undefined;
    onChange: (range: DateRange | undefined) => void;
    className?: string;
};

export default function DateRangePicker({ value, onChange, className }: Props) {
    const label = value?.from
        ? value.to
            ? `${format(value.from, "dd MMM yyyy", { locale: es })} - ${format(value.to, "dd MMM yyyy", { locale: es })}`
            : `${format(value.from, "dd MMM yyyy", { locale: es })}`
        : "Selecciona rango";

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    id="date"
                    variant="outline"
                    className={cn("w-[260px] justify-start text-left font-normal", !value && "text-muted-foreground", className)}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {label}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    initialFocus
                    mode="range"
                    selected={value}
                    onSelect={onChange}
                    numberOfMonths={2}
                    locale={es}
                />
            </PopoverContent>
        </Popover>
    );
}
