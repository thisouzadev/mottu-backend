# Estudo de Caso: Melhoria na Manutenção de Motos da Oficina Mottu

## 1. Identificação de Motos que Excederam o Tempo de Conserto

Para identificar quais motos excederam o tempo estimado de conserto e quanto tempo extra foi necessário, utilize o seguinte código:

```typescript
async getExcessiveRepairs() {
  const consertos = await this.prisma.consertoDeMotos.findMany({
    include: {
      tipoConserto: true,
    },
  });

  const result = consertos
    .filter((conserto) => {
      const tempoEstimado = conserto.tipoConserto.tempoEstimado;
      const tempoReal = conserto.tempoReal ?? 0;
      return tempoReal > tempoEstimado;
    })
    .map((conserto) => {
      const tempoEstimado = conserto.tipoConserto.tempoEstimado;
      const tempoReal = conserto.tempoReal ?? 0;
      const tempoExtra = tempoReal - tempoEstimado;

      return {
        motoId: conserto.motoId,
        tempoReal,
        tempoEstimado,
        tempoExtra,
      };
    });

  const count = result.length;

  return {
    count,
    repairs: result,
  };
}

## 2. Apresentação do Mecânico Mais Eficiente

Para determinar o mecânico mais eficiente, considerando apenas as motos consertadas, utilize o seguinte código:

```typescript
async getMostEfficientMechanic() {
  const consertos = await this.prisma.consertoDeMotos.findMany({
    include: {
      tipoConserto: true,
      mecanico: true,
    },
  });

  const mecanicosMap = new Map<
    number,
    {
      nome: string;
      tempoTrabalhado: number;
      tempoDentroDoEstimado: number;
      tempoExtra: number;
    }
  >();

  consertos.forEach((conserto) => {
    const tempoEstimado = conserto.tipoConserto.tempoEstimado;
    const tempoReal = conserto.tempoReal ?? 0;
    const tempoExtra = Math.max(0, tempoReal - tempoEstimado);
    const tempoDentroDoEstimado = Math.min(tempoReal, tempoEstimado);

    if (conserto.mecanicoId !== null) {
      if (!mecanicosMap.has(conserto.mecanicoId)) {
        mecanicosMap.set(conserto.mecanicoId, {
          nome: conserto.mecanico.nome,
          tempoTrabalhado: 0,
          tempoDentroDoEstimado: 0,
          tempoExtra: 0,
        });
      }

      const mecanico = mecanicosMap.get(conserto.mecanicoId)!;
      mecanico.tempoTrabalhado += tempoReal;
      mecanico.tempoDentroDoEstimado += tempoDentroDoEstimado;
      mecanico.tempoExtra += tempoExtra;
    }
  });

  const result = Array.from(mecanicosMap.values()).map((mecanico) => {
    const eficiencia =
      mecanico.tempoDentroDoEstimado / mecanico.tempoTrabalhado;

    return {
      nome: mecanico.nome,
      tempoTrabalhado: mecanico.tempoTrabalhado,
      tempoDentroDoEstimado: mecanico.tempoDentroDoEstimado,
      tempoExtra: mecanico.tempoExtra,
      eficiencia,
    };
  });

  // Ordenar os mecânicos pela eficiência em ordem decrescente
  const sortedResult = result.sort((a, b) => b.eficiencia - a.eficiencia);

  const count = sortedResult.length;

  return {
    count,
    repairs: sortedResult,
  };
}

## 3. Métodos para Manutenção da Tabela de Motos

### Adicionar Nova Moto

Para adicionar uma nova moto e registrar o conserto, utilize o seguinte código:

```typescript
async addMoto(data: {
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  cpf?: string;
  complexidadeDoConserto: number;
  tipoConsertoId: number;
}): Promise<Moto> {
  const moto = await this.prisma.moto.create({
    data: {
      marca: data.marca,
      modelo: data.modelo,
      ano: data.ano,
      cor: data.cor,
      cpf: data.cpf || null,
    },
  });

  await this.prisma.consertoDeMotos.create({
    data: {
      motoId: moto.id,
      complexidadeDoConserto: data.complexidadeDoConserto,
      tipoConsertoId: data.tipoConsertoId,
      dataEntrada: new Date(),
    },
  });

  return moto;
}
