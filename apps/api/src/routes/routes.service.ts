import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.RouteCreateInput) {
    return this.prisma.route.create({ data });
  }

  async findAll() {
    return this.prisma.route.findMany({ include: { stops: true } });
  }

  async findOne(id: string) {
    return this.prisma.route.findUnique({ where: { id }, include: { stops: { orderBy: { sequence: 'asc' } } } });
  }

  async update(id: string, data: Prisma.RouteUpdateInput) {
    return this.prisma.route.update({ where: { id }, data });
  }
}
