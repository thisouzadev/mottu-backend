import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Moto } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private readonly mechanicsService: AppService) {}

  @Get('excessive-repairs')
  async getExcessiveRepairs() {
    return this.mechanicsService.getExcessiveRepairs();
  }

  @Get('mostEfficient-mechanic')
  async getMostEfficientMechanic() {
    return this.mechanicsService.getMostEfficientMechanic();
  }

  @Post('add')
  async addMoto(
    @Body()
    data: {
      marca: string;
      modelo: string;
      ano: number;
      cor: string;
      cpf?: string;
      complexidadeDoConserto: number;
      tipoConsertoId: number;
    },
  ): Promise<Moto> {
    return this.mechanicsService.addMoto(data);
  }

  @Post('improvement')
  @HttpCode(HttpStatus.OK)
  async addMotoImprovement(
    @Body() data: { id: number; tempoReal: number; mecanicoId: number },
  ): Promise<void> {
    if (data.id <= 0 || data.tempoReal < 0 || data.mecanicoId <= 0) {
      throw new BadRequestException('Dados inválidos.');
    }

    await this.mechanicsService.addMotoImprovement(data);
  }
}
