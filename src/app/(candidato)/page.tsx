import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, /* AvatarImage */ } from "@/components/ui/avatar";
import { MapPin, Search, User, Globe } from "lucide-react";
import { getOFertasLaboralesAbiertas } from "../actions/ofertas-actions";
import JobsCarousel from "@/components/jobcarousel";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { unstable_noStore as noStore } from "next/cache";

const categories = [
  { name: "Tecnología", icon: <Globe className="h-4 w-4" /> },
  { name: "Marketing", icon: <Globe className="h-4 w-4" /> },
  { name: "Finanzas", icon: <Globe className="h-4 w-4" /> },
  { name: "Producción", icon: <Globe className="h-4 w-4" /> },
  { name: "Recursos Humanos", icon: <Globe className="h-4 w-4" /> },
  { name: "Logística", icon: <Globe className="h-4 w-4" /> },
  { name: "Atención al cliente", icon: <Globe className="h-4 w-4" /> },
  { name: "I+D", icon: <Globe className="h-4 w-4" /> },
];

const testimonios = [
  {
    quote: "EmpresaX me permitió crecer profesionalmente y cumplir mis metas.",
    name: "María",
    area: "Producto",
  },
  {
    quote: "Un ambiente de trabajo que realmente motiva.",
    name: "Jorge",
    area: "Tecnología",
  },
  {
    quote: "Liderazgo cercano y oportunidades reales de desarrollo.",
    name: "Lucía",
    area: "Finanzas",
  },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  noStore();

  const session = await auth();
  const userId = session?.user?.id as string | undefined;

  const ofertasLaboralesAbiertas = await getOFertasLaboralesAbiertas(userId);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16">
      {/* <Hero /> */}

      <section className="mt-8 flex flex-col gap-2">
        <div className="flex justify-between">
          <div className="flex flex-col gap-0">
            <h2 className="text-lg font-semibold text-slate-900">Ofertas recientes</h2>
            <p className="text-sm text-slate-500 mb-3">Vacantes seleccionadas por nuestro equipo de talento.</p>
          </div>
          <Link href="/ofertas" className="flex justify-end">
            <Button className="bg-emerald-600 hover:bg-emerald-700">Ver todas las vacantes</Button>
          </Link>
        </div>
        <JobsCarousel jobs={ofertasLaboralesAbiertas} />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Nuestro impacto</h2>
        <p className="text-sm text-slate-500 mb-3">Lo que estamos construyendo juntos.</p>
        <ImpactStats />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Categorías de empleo</h2>
        <p className="text-sm text-slate-500 mb-3">Explora oportunidades por área.</p>
        <CategoriesGrid />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Historias de nuestro equipo</h2>
        <p className="text-sm text-slate-500 mb-3">Personas reales, crecimiento real.</p>
        <Testimonials />
      </section>

      <section className="mt-12">
        <CTA />
      </section>
    </main>
  );
}

function ImpactStats() {
  const stats = [
    { label: "+20 vacantes disponibles", sub: "Actualizadas cada semana", icon: <Search className="h-4 w-4" /> },
    { label: "Presente en +5 ciudades", sub: "Cobertura nacional", icon: <MapPin className="h-4 w-4" /> },
    { label: "+500 colaboradores", sub: "Y seguimos creciendo", icon: <User className="h-4 w-4" /> },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
      {stats.map((s, i) => (
        <Card key={i} className="border-slate-200">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">{s.icon}</div>
            <div>
              <p className="text-sm font-medium text-slate-900">{s.label}</p>
              <p className="text-xs text-slate-500">{s.sub}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CategoriesGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {categories.map((c) => (
        <Card key={c.name} className="border-slate-200 transition-shadow hover:shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-700">{c.icon}</div>
            <span className="text-sm font-medium text-slate-800">{c.name}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Testimonials() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {testimonios.map((t, i) => (
        <Card key={i} className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-sm text-slate-700">“{t.quote}”</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <Avatar className="h-6 w-6">
                <AvatarFallback>{t.name[0]}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-slate-700">{t.name}</span>
              <span>• {t.area}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CTA() {
  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-900 md:flex-row">
      <p className="text-sm md:text-base">¿Listo para dar el siguiente paso en tu carrera?</p>
      <Link href="/ofertas" className="flex justify-end">
        <Button className="bg-emerald-600 hover:bg-emerald-700">Ver todas las vacantes</Button>
      </Link>
    </div>
  );
}
