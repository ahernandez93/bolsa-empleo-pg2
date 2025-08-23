-- DropForeignKey
ALTER TABLE "public"."OfertaLaboral" DROP CONSTRAINT "OfertaLaboral_reclutadorId_fkey";

-- AlterTable
ALTER TABLE "public"."OfertaLaboral" ALTER COLUMN "reclutadorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."OfertaLaboral" ADD CONSTRAINT "OfertaLaboral_reclutadorId_fkey" FOREIGN KEY ("reclutadorId") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
