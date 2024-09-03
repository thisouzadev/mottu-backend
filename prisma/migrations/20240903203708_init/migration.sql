/*
  Warnings:

  - Added the required column `cor` to the `Moto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Moto" ADD COLUMN     "cor" TEXT NOT NULL;
