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
```

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
```

## 3. Métodos para Manutenção da Tabela de Motos

### Adicionar Nova Moto e informações da moto consertada

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

  async addMotoImprovement(data: {
    id: number;
    tempoReal: number;
    mecanicoId: number;
  }): Promise<void> {
    await this.prisma.consertoDeMotos.updateMany({
      where: { motoId: data.id },
      data: {
        tempoReal: data.tempoReal,
        mecanicoId: data.mecanicoId,
      },
    });
  }
```

## 4. Sugestões para a Estrutura das Tabelas

Para melhorar a estrutura das tabelas de manutenção, considere as seguintes mudanças:

### Adicionar Tabela de Funcionários

Crie uma tabela separada para armazenar informações dos mecânicos e recepcionistas. Isso permitirá uma melhor organização e gestão dos funcionários envolvidos no processo de manutenção.

### Adicionar Histórico de Manutenção

Inclua uma tabela para manter um histórico detalhado de todas as manutenções realizadas. Isso permitirá uma análise mais detalhada e o rastreamento de todos os serviços prestados, o que pode ser útil para auditorias e avaliações de desempenho.

### Relacionamento entre Tabelas

Verifique e otimize os relacionamentos entre tabelas para garantir a integridade referencial e melhorar a performance das consultas. Certifique-se de que as relações entre motos, consertos, funcionários e tipos de conserto estão bem definidas e que as chaves estrangeiras estão corretamente configuradas para evitar inconsistências nos dados.

## 5. Descrição do Processo de Manutenção de Motos

O processo de manutenção de motos é descrito em etapas:

### 1. Recepção da Moto

O cliente leva a moto até a base e entrega para os recepcionistas. Os recepcionistas registram a entrada da moto e verificam as informações iniciais.

### 2. Triagem

A equipe de triagem realiza uma triagem inicial para avaliar o estado da moto e identificar o tipo de conserto necessário. Uma linha é adicionada na tabela de consertos para registrar a moto e o serviço requerido.

### 3. Manutenção

O mecânico inicia e finaliza a manutenção da moto. Durante este processo, o mecânico atualiza as informações na tabela de consertos, incluindo o tempo real gasto e qualquer outro detalhe relevante sobre o serviço.

### 4. Devolução

Após a conclusão do conserto, a moto é devolvida para os recepcionistas. Os recepcionistas então entregam a moto de volta ao cliente, finalizando o processo de manutenção.

[codigo do projeto](https://github.com/thisouzadev/mottu-backend)
