"use client";
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PaginationBar() {
    return (
        <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1"><ChevronLeft className="h-4 w-4" /> Anterior</Button>
                <div className="flex items-center gap-1">
                    {[1, 2, 3].map((n) => (
                        <Button key={n} variant={n === 1 ? "default" : "outline"} size="sm">{n}</Button>
                    ))}
                </div>
                <Button variant="outline" size="sm" className="gap-1">Siguiente <ChevronRight className="h-4 w-4" /></Button>
            </div>
            {/* <Button variant="secondary">Cargar más</Button> */}
        </div>
    );
}
