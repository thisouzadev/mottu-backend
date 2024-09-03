-- CreateTable
CREATE TABLE "Moto" (
    "id" SERIAL NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,

    CONSTRAINT "Moto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConsertoDeMotos_motoId_idx" ON "ConsertoDeMotos"("motoId");

-- AddForeignKey
ALTER TABLE "ConsertoDeMotos" ADD CONSTRAINT "ConsertoDeMotos_motoId_fkey" FOREIGN KEY ("motoId") REFERENCES "Moto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
