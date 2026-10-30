import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Successfully connected to PostgreSQL via Prisma');
    } catch (err: any) {
      console.warn('Prisma could not connect to PostgreSQL on startup:', err?.message || err);
    }
  }
}
