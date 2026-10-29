import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class StopsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.StopCreateInput) {
    return this.prisma.stop.create({ data });
  }

  async findAll() {
    return this.prisma.stop.findMany();
  }

  async findNearby(lat: number, lng: number, radius: number) {
    return this.prisma.stop.findMany({ take: 20 }); // Simplified for MVP
  }
}
