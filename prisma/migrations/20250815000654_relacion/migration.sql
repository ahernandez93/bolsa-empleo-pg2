-- DropForeignKey
ALTER TABLE "public"."Empleado" DROP CONSTRAINT "Empleado_cargoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Empleado" DROP CONSTRAINT "Empleado_departamentoId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Empleado" ADD CONSTRAINT "Empleado_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "public"."Departamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Empleado" ADD CONSTRAINT "Empleado_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "public"."Cargo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
