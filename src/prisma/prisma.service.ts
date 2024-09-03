import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Prisma client connected');
    } catch (error) {
      console.error('Failed to connect to Prisma client', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      console.log('Prisma client disconnected');
    } catch (error) {
      console.error('Failed to disconnect Prisma client', error);
    }
  }
}
