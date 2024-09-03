/*
  Warnings:

  - The primary key for the `ConsertoDeMotos` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "ConsertoDeMotos" DROP CONSTRAINT "ConsertoDeMotos_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "motoId" DROP DEFAULT,
ADD CONSTRAINT "ConsertoDeMotos_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ConsertoDeMotos_motoId_seq";
