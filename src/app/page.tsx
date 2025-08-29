// "use client";

// import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, MapPin, Building2, Briefcase, Search, User, Globe } from "lucide-react";
import { auth } from "@/lib/auth/auth";
import { Session } from "next-auth";
import NavUserCandidato from "@/components/nav-user-candidato";
// -----------------------------------------------------------------------------
// Página: Home de empleos para una sola empresa (JobFlow / EmpresaX Careers)
// -----------------------------------------------------------------------------

const jobs: JobCardProps[] = [
  {
    title: "Desarrollador Backend",
    company: "EmpresaX",
    location: "Madrid",
    modality: "Remoto",
    contract: "Indefinido",
    department: "Tecnología",
  },
  {
    title: "Analista de Datos",
    company: "EmpresaX",
    location: "Barcelona",
    modality: "Híbrido",
    contract: "Temporal",
    department: "Business Intelligence",
  },
  {
    title: "Diseñador UX/UI",
    company: "EmpresaX",
    location: "Remoto",
    modality: "Remoto",
    contract: "Indefinido",
    department: "Producto",
  },
  {
    title: "Project Manager",
    company: "EmpresaX",
    location: "Valencia",
    modality: "Presencial",
    contract: "Indefinido",
    department: "Operaciones",
  },
  {
    title: "QA Engineer",
    company: "EmpresaX",
    location: "Sevilla",
    modality: "Híbrido",
    contract: "Indefinido",
    department: "Calidad",
  },
];

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

export default async function HomePage() {
  const session = await auth();
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header session={session} />
      <main className="mx-auto max-w-6xl px-4 pb-16">
        <Hero />

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">Ofertas destacadas</h2>
          <p className="text-sm text-slate-500 mb-3">Vacantes seleccionadas por nuestro equipo de talento.</p>
          <JobsCarousel jobs={jobs} />
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
    </div>
  );
}

function Header({ session }: { session: Session | null }) {

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold">X</div>
          <span className="font-semibold">EmpresaX Careers</span>
        </div>
        <nav className="hidden gap-6 text-sm text-slate-600 md:flex">
          <a className="font-medium hover:text-slate-900" href="#">Ofertas</a>
          {session ? (
            <>
              <a className="font-medium hover:text-slate-900" href="#">Guardados</a>
              <a className="font-medium hover:text-slate-900" href="#">Mis Postulaciones</a>
            </>
          ) : (
            <>
              <a className="font-medium hover:text-slate-900" href="#">Registrate</a>
              <a className="font-medium hover:text-slate-900" href="#">Iniciar Sesión</a>
            </>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {/* <Button variant="outline" size="sm" className="hidden md:inline-flex">Publicar CV</Button> */}
          {/* <Avatar className="h-8 w-8">
            <AvatarImage alt="Alex" src="" />
            <AvatarFallback>AR</AvatarFallback>
          </Avatar> */}
          <NavUserCandidato session={session} />
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="pt-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Construye tu futuro con EmpresaX</h1>
      <p className="mt-1 text-slate-500">Explora las oportunidades que tenemos para ti y únete a nuestro equipo</p>

      <Card className="mt-4 border-slate-200">
        <CardContent className="p-3 md:p-4">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_240px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Puesto o palabra clave" className="pl-9" />
            </div>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Ubicación" className="pl-9" />
            </div>
            <Button className="md:ml-2">Buscar</Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full">Remoto</Badge>
            <Badge variant="secondary" className="rounded-full">Junior</Badge>
            <Badge variant="secondary" className="rounded-full">Tiempo completo</Badge>
            <Badge variant="secondary" className="rounded-full">Tecnología</Badge>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

type JobCardProps = {
  title: string;
  company: string;
  location: string;
  modality: string;
  contract: string;
  department: string;
};

function JobsCarousel({ jobs }: { jobs: JobCardProps[] }) {
  /* const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (delta: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }; */

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -left-2 top-1/2 hidden -translate-y-1/2 md:block">
        <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow" /* onClick={() => scrollBy(-360)} */>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      <div className="pointer-events-none absolute -right-2 top-1/2 hidden -translate-y-1/2 md:block">
        <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow" /* onClick={() => scrollBy(360)} */>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div
        // ref={ref}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 py-2 pr-2"
        aria-label="Ofertas destacadas"
      >
        {jobs.map((job, idx) => (
          <div key={idx} className="min-w-[300px] max-w-[320px] snap-start">
            <JobCard {...job} />
          </div>
        ))}
      </div>
    </div>
  );
}

function JobCard({ title, company, location, modality, contract, department }: JobCardProps) {
  return (
    <Card className="h-full border-slate-200 flex flex-col">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{company[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <CardTitle className="truncate text-base">{title}</CardTitle>
            <p className="truncate text-xs text-slate-500">{department}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between space-y-3">
        <div className="grid grid-cols-1 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{location}</span>
          <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{modality}</span>
          <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{contract}</span>
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
          <span>Publicado hace 2 días</span>
        </div>
      </CardContent>
    </Card>
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
      <Button className="bg-emerald-600 hover:bg-emerald-700">Ver todas las vacantes</Button>
    </div>
  );
}
