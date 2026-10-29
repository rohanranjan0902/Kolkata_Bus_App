import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const { name, phone, licenseNumber, password } = data;
    const hashedPassword = await bcrypt.hash(password || '123456', 10);
    
    return this.prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        role: 'DRIVER',
        driver: {
          create: {
            licenseNumber,
          }
        }
      },
      include: { driver: true }
    });
  }

  async findAll() {
    return this.prisma.driver.findMany({ include: { user: true, bus: true } });
  }

  async findOne(id: string) {
    return this.prisma.driver.findUnique({ where: { id }, include: { user: true, bus: true } });
  }

  async update(id: string, data: Prisma.DriverUpdateInput) {
    return this.prisma.driver.update({ where: { id }, data });
  }
}
