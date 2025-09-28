/*
  Warnings:

  - Made the column `cargoId` on table `Empleado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `departamentoId` on table `Empleado` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Empleado" ALTER COLUMN "cargoId" SET NOT NULL,
ALTER COLUMN "departamentoId" SET NOT NULL;
