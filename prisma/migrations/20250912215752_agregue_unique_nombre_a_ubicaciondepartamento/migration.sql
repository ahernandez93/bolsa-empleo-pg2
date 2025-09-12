/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `UbicacionDepartamento` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UbicacionDepartamento_nombre_key" ON "public"."UbicacionDepartamento"("nombre");
