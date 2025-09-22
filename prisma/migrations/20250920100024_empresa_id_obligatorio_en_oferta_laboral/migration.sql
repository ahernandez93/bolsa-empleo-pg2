/*
  Warnings:

  - Made the column `empresaId` on table `OfertaLaboral` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."OfertaLaboral" ALTER COLUMN "empresaId" SET NOT NULL;
