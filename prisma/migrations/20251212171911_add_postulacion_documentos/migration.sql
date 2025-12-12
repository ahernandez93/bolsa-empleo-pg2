-- CreateEnum
CREATE TYPE "public"."DocumentoEstado" AS ENUM ('PENDIENTE', 'SUBIDO', 'RECHAZADO', 'APROBADO');

-- CreateTable
CREATE TABLE "public"."DocumentoTipo" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "requerido" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "ayuda" TEXT,
    "aceptaPdf" BOOLEAN NOT NULL DEFAULT true,
    "aceptaImg" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentoTipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PostulacionDocumento" (
    "id" TEXT NOT NULL,
    "postulacionId" TEXT NOT NULL,
    "documentoTipoId" TEXT NOT NULL,
    "estado" "public"."DocumentoEstado" NOT NULL DEFAULT 'PENDIENTE',
    "url" TEXT,
    "key" TEXT,
    "mimeType" TEXT,
    "size" INTEGER,
    "subidoEn" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostulacionDocumento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoTipo_codigo_key" ON "public"."DocumentoTipo"("codigo");

-- CreateIndex
CREATE INDEX "PostulacionDocumento_postulacionId_idx" ON "public"."PostulacionDocumento"("postulacionId");

-- CreateIndex
CREATE UNIQUE INDEX "PostulacionDocumento_postulacionId_documentoTipoId_key" ON "public"."PostulacionDocumento"("postulacionId", "documentoTipoId");

-- AddForeignKey
ALTER TABLE "public"."PostulacionDocumento" ADD CONSTRAINT "PostulacionDocumento_postulacionId_fkey" FOREIGN KEY ("postulacionId") REFERENCES "public"."Postulacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostulacionDocumento" ADD CONSTRAINT "PostulacionDocumento_documentoTipoId_fkey" FOREIGN KEY ("documentoTipoId") REFERENCES "public"."DocumentoTipo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
