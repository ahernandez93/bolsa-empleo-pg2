-- CreateEnum
CREATE TYPE "public"."TipoTrabajo" AS ENUM ('PERMANENTE', 'TEMPORAL');

-- CreateEnum
CREATE TYPE "public"."Modalidad" AS ENUM ('PRESENCIAL', 'REMOTO', 'HIBRIDO');

-- CreateEnum
CREATE TYPE "public"."EstadoOferta" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'CERRADA');

-- CreateTable
CREATE TABLE "public"."OfertaLaboral" (
    "id" TEXT NOT NULL,
    "puesto" TEXT NOT NULL,
    "descripcionPuesto" TEXT NOT NULL,
    "area" TEXT,
    "ubicacionPais" TEXT NOT NULL,
    "ubicacionDepartamento" TEXT,
    "ubicacionCiudad" TEXT,
    "empresa" TEXT NOT NULL,
    "nivelAcademico" TEXT,
    "experienciaLaboral" TEXT,
    "tipoTrabajo" "public"."TipoTrabajo" NOT NULL,
    "modalidad" "public"."Modalidad" NOT NULL,
    "salario" DOUBLE PRECISION,
    "reclutadorId" TEXT NOT NULL,
    "agregadoPorId" TEXT NOT NULL,
    "actualizadoPorId" TEXT,
    "aprobadoPorId" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "estado" "public"."EstadoOferta" NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT "OfertaLaboral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Habilidad" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Habilidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OfertaHabilidad" (
    "id" SERIAL NOT NULL,
    "ofertaLaboralId" TEXT NOT NULL,
    "habilidadId" INTEGER NOT NULL,

    CONSTRAINT "OfertaHabilidad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Habilidad_nombre_key" ON "public"."Habilidad"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "OfertaHabilidad_ofertaLaboralId_habilidadId_key" ON "public"."OfertaHabilidad"("ofertaLaboralId", "habilidadId");

-- AddForeignKey
ALTER TABLE "public"."OfertaLaboral" ADD CONSTRAINT "OfertaLaboral_reclutadorId_fkey" FOREIGN KEY ("reclutadorId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OfertaLaboral" ADD CONSTRAINT "OfertaLaboral_agregadoPorId_fkey" FOREIGN KEY ("agregadoPorId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OfertaLaboral" ADD CONSTRAINT "OfertaLaboral_actualizadoPorId_fkey" FOREIGN KEY ("actualizadoPorId") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OfertaLaboral" ADD CONSTRAINT "OfertaLaboral_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OfertaHabilidad" ADD CONSTRAINT "OfertaHabilidad_ofertaLaboralId_fkey" FOREIGN KEY ("ofertaLaboralId") REFERENCES "public"."OfertaLaboral"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OfertaHabilidad" ADD CONSTRAINT "OfertaHabilidad_habilidadId_fkey" FOREIGN KEY ("habilidadId") REFERENCES "public"."Habilidad"("id") ON DELETE CASCADE ON UPDATE CASCADE;
