/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `Empresa` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `Suscripcion` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Empresa" ADD COLUMN     "stripeCustomerId" TEXT;

-- AlterTable
ALTER TABLE "public"."Suscripcion" ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripePriceId" TEXT,
ADD COLUMN     "stripeStatus" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_stripeCustomerId_key" ON "public"."Empresa"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Suscripcion_stripeSubscriptionId_key" ON "public"."Suscripcion"("stripeSubscriptionId");
