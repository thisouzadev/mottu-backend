import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { Moto } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

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
}
