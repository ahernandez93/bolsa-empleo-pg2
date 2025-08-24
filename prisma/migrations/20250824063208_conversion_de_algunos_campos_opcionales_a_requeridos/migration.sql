/*
  Warnings:

  - Made the column `area` on table `OfertaLaboral` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ubicacionDepartamento` on table `OfertaLaboral` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ubicacionCiudad` on table `OfertaLaboral` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nivelAcademico` on table `OfertaLaboral` required. This step will fail if there are existing NULL values in that column.
  - Made the column `experienciaLaboral` on table `OfertaLaboral` required. This step will fail if there are existing NULL values in that column.
  - Made the column `salario` on table `OfertaLaboral` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."OfertaLaboral" ALTER COLUMN "area" SET NOT NULL,
ALTER COLUMN "ubicacionDepartamento" SET NOT NULL,
ALTER COLUMN "ubicacionCiudad" SET NOT NULL,
ALTER COLUMN "nivelAcademico" SET NOT NULL,
ALTER COLUMN "experienciaLaboral" SET NOT NULL,
ALTER COLUMN "salario" SET NOT NULL;
