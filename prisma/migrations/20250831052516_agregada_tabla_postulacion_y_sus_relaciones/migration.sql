-- CreateEnum
CREATE TYPE "public"."EstadoPostulacion" AS ENUM ('SOLICITUD', 'ENTREVISTA', 'EVALUACIONES', 'CONTRATACION', 'RECHAZADA');

-- CreateTable
CREATE TABLE "public"."Postulacion" (
    "id" TEXT NOT NULL,
    "ofertaLaboralId" TEXT NOT NULL,
    "perfilCandidatoId" TEXT NOT NULL,
    "estado" "public"."EstadoPostulacion" NOT NULL DEFAULT 'SOLICITUD',
    "cvSnapshotUrl" TEXT,
    "cvSnapshotKey" TEXT,
    "notasInternas" TEXT,
    "fechaPostulacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Postulacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Postulacion_ofertaLaboralId_idx" ON "public"."Postulacion"("ofertaLaboralId");

-- CreateIndex
CREATE INDEX "Postulacion_perfilCandidatoId_idx" ON "public"."Postulacion"("perfilCandidatoId");

-- CreateIndex
CREATE INDEX "Postulacion_estado_idx" ON "public"."Postulacion"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "Postulacion_ofertaLaboralId_perfilCandidatoId_key" ON "public"."Postulacion"("ofertaLaboralId", "perfilCandidatoId");

-- AddForeignKey
ALTER TABLE "public"."Postulacion" ADD CONSTRAINT "Postulacion_ofertaLaboralId_fkey" FOREIGN KEY ("ofertaLaboralId") REFERENCES "public"."OfertaLaboral"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Postulacion" ADD CONSTRAINT "Postulacion_perfilCandidatoId_fkey" FOREIGN KEY ("perfilCandidatoId") REFERENCES "public"."PerfilCandidato"("id") ON DELETE CASCADE ON UPDATE CASCADE;
