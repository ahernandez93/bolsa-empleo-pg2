-- CreateTable
CREATE TABLE "public"."GuardadoOferta" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ofertaLaboralId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuardadoOferta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuardadoOferta_userId_idx" ON "public"."GuardadoOferta"("userId");

-- CreateIndex
CREATE INDEX "GuardadoOferta_ofertaLaboralId_idx" ON "public"."GuardadoOferta"("ofertaLaboralId");

-- CreateIndex
CREATE UNIQUE INDEX "GuardadoOferta_userId_ofertaLaboralId_key" ON "public"."GuardadoOferta"("userId", "ofertaLaboralId");

-- AddForeignKey
ALTER TABLE "public"."GuardadoOferta" ADD CONSTRAINT "GuardadoOferta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuardadoOferta" ADD CONSTRAINT "GuardadoOferta_ofertaLaboralId_fkey" FOREIGN KEY ("ofertaLaboralId") REFERENCES "public"."OfertaLaboral"("id") ON DELETE CASCADE ON UPDATE CASCADE;
