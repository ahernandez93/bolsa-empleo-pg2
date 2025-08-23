/*
  Warnings:

  - The values [APROBADA] on the enum `EstadoOferta` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."EstadoOferta_new" AS ENUM ('PENDIENTE', 'ABIERTA', 'RECHAZADA', 'CERRADA');
ALTER TABLE "public"."OfertaLaboral" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "public"."OfertaLaboral" ALTER COLUMN "estado" TYPE "public"."EstadoOferta_new" USING ("estado"::text::"public"."EstadoOferta_new");
ALTER TYPE "public"."EstadoOferta" RENAME TO "EstadoOferta_old";
ALTER TYPE "public"."EstadoOferta_new" RENAME TO "EstadoOferta";
DROP TYPE "public"."EstadoOferta_old";
ALTER TABLE "public"."OfertaLaboral" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE';
COMMIT;
