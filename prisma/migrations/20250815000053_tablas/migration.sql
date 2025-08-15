/*
  Warnings:

  - You are about to drop the column `cargo` on the `Empleado` table. All the data in the column will be lost.
  - You are about to drop the column `departamento` on the `Empleado` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Empleado" DROP COLUMN "cargo",
DROP COLUMN "departamento",
ADD COLUMN     "cargoId" INTEGER,
ADD COLUMN     "departamentoId" INTEGER;

-- CreateTable
CREATE TABLE "public"."Departamento" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Departamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Cargo" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cargo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Empleado" ADD CONSTRAINT "Empleado_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "public"."Departamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Empleado" ADD CONSTRAINT "Empleado_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "public"."Cargo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
