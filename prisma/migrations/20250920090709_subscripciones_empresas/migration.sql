/*
  Warnings:

  - You are about to drop the column `empresa` on the `OfertaLaboral` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Empleado" ADD COLUMN     "empresaId" TEXT;

-- AlterTable
ALTER TABLE "public"."OfertaLaboral" DROP COLUMN "empresa",
ADD COLUMN     "destacada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "empresaId" TEXT;

-- AlterTable
ALTER TABLE "public"."Usuario" ADD COLUMN     "empresaId" TEXT;

-- CreateTable
CREATE TABLE "public"."Empresa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rtn" TEXT,
    "sitioWeb" TEXT,
    "telefono" TEXT,
    "descripcion" TEXT,
    "ubicacionDepartamentoId" INTEGER,
    "ubicacionCiudadId" INTEGER,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Plan" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precioMensual" DOUBLE PRECISION NOT NULL,
    "duracionMeses" INTEGER NOT NULL,
    "maxOfertasActivas" INTEGER NOT NULL,
    "incluyeDestacado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Suscripcion" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "canceladaEn" TIMESTAMP(3),

    CONSTRAINT "Suscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_nombre_key" ON "public"."Empresa"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_nombre_key" ON "public"."Plan"("nombre");

-- CreateIndex
CREATE INDEX "Suscripcion_empresaId_idx" ON "public"."Suscripcion"("empresaId");

-- CreateIndex
CREATE INDEX "Suscripcion_planId_idx" ON "public"."Suscripcion"("planId");

-- CreateIndex
CREATE INDEX "Empleado_empresaId_idx" ON "public"."Empleado"("empresaId");

-- CreateIndex
CREATE INDEX "OfertaLaboral_empresaId_idx" ON "public"."OfertaLaboral"("empresaId");

-- CreateIndex
CREATE INDEX "Usuario_empresaId_idx" ON "public"."Usuario"("empresaId");

-- AddForeignKey
ALTER TABLE "public"."Empresa" ADD CONSTRAINT "Empresa_ubicacionDepartamentoId_fkey" FOREIGN KEY ("ubicacionDepartamentoId") REFERENCES "public"."UbicacionDepartamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Empresa" ADD CONSTRAINT "Empresa_ubicacionCiudadId_fkey" FOREIGN KEY ("ubicacionCiudadId") REFERENCES "public"."UbicacionCiudad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Suscripcion" ADD CONSTRAINT "Suscripcion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "public"."Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Suscripcion" ADD CONSTRAINT "Suscripcion_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Usuario" ADD CONSTRAINT "Usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "public"."Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Empleado" ADD CONSTRAINT "Empleado_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "public"."Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OfertaLaboral" ADD CONSTRAINT "OfertaLaboral_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "public"."Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
