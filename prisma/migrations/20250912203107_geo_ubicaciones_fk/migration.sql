/*
  Warnings:

  - You are about to drop the column `ubicacionCiudad` on the `OfertaLaboral` table. All the data in the column will be lost.
  - You are about to drop the column `ubicacionDepartamento` on the `OfertaLaboral` table. All the data in the column will be lost.
  - You are about to drop the column `ubicacionPais` on the `OfertaLaboral` table. All the data in the column will be lost.
  - You are about to drop the column `expectativaSalarial` on the `PerfilCandidato` table. All the data in the column will be lost.
  - You are about to drop the column `experienciaTotal` on the `PerfilCandidato` table. All the data in the column will be lost.
  - You are about to drop the column `movilidad` on the `PerfilCandidato` table. All the data in the column will be lost.
  - You are about to drop the column `nivelAcademico` on the `PerfilCandidato` table. All the data in the column will be lost.
  - Added the required column `ubicacionCiudadId` to the `OfertaLaboral` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ubicacionDepartamentoId` to the `OfertaLaboral` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Genero" AS ENUM ('MASCULINO', 'FEMENINO');

-- AlterTable
ALTER TABLE "public"."OfertaLaboral" DROP COLUMN "ubicacionCiudad",
DROP COLUMN "ubicacionDepartamento",
DROP COLUMN "ubicacionPais",
ADD COLUMN     "ubicacionCiudadId" INTEGER NOT NULL,
ADD COLUMN     "ubicacionDepartamentoId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."PerfilCandidato" DROP COLUMN "expectativaSalarial",
DROP COLUMN "experienciaTotal",
DROP COLUMN "movilidad",
DROP COLUMN "nivelAcademico",
ADD COLUMN     "cambioResidencia" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "disponibilidadViajar" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "poseeVehiculo" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Persona" ADD COLUMN     "genero" "public"."Genero",
ADD COLUMN     "ubicacionCiudadId" INTEGER,
ADD COLUMN     "ubicacionDepartamentoId" INTEGER;

-- CreateTable
CREATE TABLE "public"."UbicacionDepartamento" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UbicacionDepartamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UbicacionCiudad" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "departamentoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UbicacionCiudad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UbicacionCiudad_departamentoId_nombre_key" ON "public"."UbicacionCiudad"("departamentoId", "nombre");

-- CreateIndex
CREATE INDEX "OfertaLaboral_ubicacionDepartamentoId_idx" ON "public"."OfertaLaboral"("ubicacionDepartamentoId");

-- CreateIndex
CREATE INDEX "OfertaLaboral_ubicacionCiudadId_idx" ON "public"."OfertaLaboral"("ubicacionCiudadId");

-- AddForeignKey
ALTER TABLE "public"."UbicacionCiudad" ADD CONSTRAINT "UbicacionCiudad_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "public"."UbicacionDepartamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Persona" ADD CONSTRAINT "Persona_ubicacionDepartamentoId_fkey" FOREIGN KEY ("ubicacionDepartamentoId") REFERENCES "public"."UbicacionDepartamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Persona" ADD CONSTRAINT "Persona_ubicacionCiudadId_fkey" FOREIGN KEY ("ubicacionCiudadId") REFERENCES "public"."UbicacionCiudad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OfertaLaboral" ADD CONSTRAINT "OfertaLaboral_ubicacionDepartamentoId_fkey" FOREIGN KEY ("ubicacionDepartamentoId") REFERENCES "public"."UbicacionDepartamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OfertaLaboral" ADD CONSTRAINT "OfertaLaboral_ubicacionCiudadId_fkey" FOREIGN KEY ("ubicacionCiudadId") REFERENCES "public"."UbicacionCiudad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
