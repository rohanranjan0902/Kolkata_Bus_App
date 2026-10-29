import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BusesService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.BusCreateInput) {
    return this.prisma.bus.create({ data });
  }

  async findAll() {
    return this.prisma.bus.findMany({ include: { currentDriver: true } });
  }

  async findNearby(lat: number, lng: number, radius: number) {
    // Basic implementation for now, will enhance with Redis
    return this.prisma.bus.findMany({
      where: { status: 'ON_TRIP' },
      include: { currentDriver: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.bus.findUnique({
      where: { id },
      include: { currentDriver: true, trips: true },
    });
  }

  async update(id: string, data: Prisma.BusUpdateInput) {
    return this.prisma.bus.update({ where: { id }, data });
  }
}
