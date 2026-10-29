import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.TripUncheckedCreateInput) {
    return this.prisma.trip.create({ data });
  }

  async findAll() {
    return this.prisma.trip.findMany({ include: { bus: true, driver: { include: { user: true } }, route: { include: { stops: true } } } });
  }

  async findOne(id: string) {
    return this.prisma.trip.findUnique({ where: { id }, include: { bus: true, driver: { include: { user: true } }, route: { include: { stops: true } } } });
  }

  async update(id: string, data: Prisma.TripUpdateInput) {
    return this.prisma.trip.update({ where: { id }, data });
  }
}
