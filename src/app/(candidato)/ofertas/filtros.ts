"use client";
import { useMemo, useState } from "react";

const [query, setQuery] = useState("");
const [category, setCategory] = useState<string>("");
const [location, setLocation] = useState<string>("");
const [modality, setModality] = useState<string>("");

const filtered = useMemo(() => {
    return ofertasLaboralesAbiertas.filter((j) => {
        const q = query.toLowerCase();
        const matchesQuery = !q ||
            j.puesto.toLowerCase().includes(q) ||
            j.empresa.toLowerCase().includes(q);
        const matchesCat = !category || j.area === category;
        const matchesLoc = !location || j.ubicacionCiudad.toLowerCase().includes(location.toLowerCase());
        const matchesMod = !modality || j.modalidad === modality;
        return matchesQuery && matchesCat && matchesLoc && matchesMod;
    });
}, [query, location, modality, category]);