-- CreateTable
CREATE TABLE "public"."PerfilCandidato" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "resumen" TEXT,
    "tituloProfesional" TEXT,
    "experienciaTotal" INTEGER,
    "nivelAcademico" TEXT,
    "expectativaSalarial" DOUBLE PRECISION,
    "disponibilidad" TEXT,
    "movilidad" BOOLEAN NOT NULL DEFAULT false,
    "cvUrl" TEXT,
    "cvKey" TEXT,
    "cvMimeType" TEXT,
    "cvSize" INTEGER,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerfilCandidato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PerfilCandidatoHabilidad" (
    "id" TEXT NOT NULL,
    "perfilCandidatoId" TEXT NOT NULL,
    "habilidadId" INTEGER NOT NULL,

    CONSTRAINT "PerfilCandidatoHabilidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Educacion" (
    "id" TEXT NOT NULL,
    "perfilCandidatoId" TEXT NOT NULL,
    "institucion" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "nivelAcademico" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),

    CONSTRAINT "Educacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExperienciaLaboral" (
    "id" TEXT NOT NULL,
    "perfilCandidatoId" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "puesto" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "actualmenteTrabajando" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ExperienciaLaboral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PerfilCandidato_usuarioId_key" ON "public"."PerfilCandidato"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilCandidatoHabilidad_perfilCandidatoId_habilidadId_key" ON "public"."PerfilCandidatoHabilidad"("perfilCandidatoId", "habilidadId");

-- CreateIndex
CREATE INDEX "ExperienciaLaboral_perfilCandidatoId_idx" ON "public"."ExperienciaLaboral"("perfilCandidatoId");

-- AddForeignKey
ALTER TABLE "public"."PerfilCandidato" ADD CONSTRAINT "PerfilCandidato_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PerfilCandidatoHabilidad" ADD CONSTRAINT "PerfilCandidatoHabilidad_perfilCandidatoId_fkey" FOREIGN KEY ("perfilCandidatoId") REFERENCES "public"."PerfilCandidato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PerfilCandidatoHabilidad" ADD CONSTRAINT "PerfilCandidatoHabilidad_habilidadId_fkey" FOREIGN KEY ("habilidadId") REFERENCES "public"."Habilidad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Educacion" ADD CONSTRAINT "Educacion_perfilCandidatoId_fkey" FOREIGN KEY ("perfilCandidatoId") REFERENCES "public"."PerfilCandidato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExperienciaLaboral" ADD CONSTRAINT "ExperienciaLaboral_perfilCandidatoId_fkey" FOREIGN KEY ("perfilCandidatoId") REFERENCES "public"."PerfilCandidato"("id") ON DELETE CASCADE ON UPDATE CASCADE;
