-- CreateTable
CREATE TABLE "Mecanico" (
    "mecanicoId" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "idade" INTEGER NOT NULL,
    "tempoPorDia" INTEGER NOT NULL,
    "nivelComplexidade" INTEGER NOT NULL,

    CONSTRAINT "Mecanico_pkey" PRIMARY KEY ("mecanicoId")
);

-- CreateTable
CREATE TABLE "ConsertoDeMotos" (
    "motoId" SERIAL NOT NULL,
    "complexidadeDoConserto" INTEGER NOT NULL,
    "tipoConsertoId" INTEGER NOT NULL,
    "tempoReal" INTEGER,
    "dataEntrada" TIMESTAMP(3) NOT NULL,
    "mecanicoId" INTEGER,

    CONSTRAINT "ConsertoDeMotos_pkey" PRIMARY KEY ("motoId")
);

-- CreateTable
CREATE TABLE "TipoConserto" (
    "id" SERIAL NOT NULL,
    "tempoEstimado" INTEGER NOT NULL,

    CONSTRAINT "TipoConserto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ConsertoDeMotos" ADD CONSTRAINT "ConsertoDeMotos_mecanicoId_fkey" FOREIGN KEY ("mecanicoId") REFERENCES "Mecanico"("mecanicoId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsertoDeMotos" ADD CONSTRAINT "ConsertoDeMotos_tipoConsertoId_fkey" FOREIGN KEY ("tipoConsertoId") REFERENCES "TipoConserto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
