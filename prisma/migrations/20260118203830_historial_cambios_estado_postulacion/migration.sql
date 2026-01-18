-- CreateTable
CREATE TABLE "public"."PostulacionHistorial" (
    "id" TEXT NOT NULL,
    "postulacionId" TEXT NOT NULL,
    "estadoAnterior" "public"."EstadoPostulacion" NOT NULL,
    "estadoNuevo" "public"."EstadoPostulacion" NOT NULL,
    "notasInternas" TEXT,
    "cambiadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostulacionHistorial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PostulacionHistorial_postulacionId_idx" ON "public"."PostulacionHistorial"("postulacionId");

-- CreateIndex
CREATE INDEX "PostulacionHistorial_cambiadoPorId_idx" ON "public"."PostulacionHistorial"("cambiadoPorId");

-- AddForeignKey
ALTER TABLE "public"."PostulacionHistorial" ADD CONSTRAINT "PostulacionHistorial_postulacionId_fkey" FOREIGN KEY ("postulacionId") REFERENCES "public"."Postulacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostulacionHistorial" ADD CONSTRAINT "PostulacionHistorial_cambiadoPorId_fkey" FOREIGN KEY ("cambiadoPorId") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
