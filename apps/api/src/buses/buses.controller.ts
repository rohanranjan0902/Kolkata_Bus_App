import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { BusesService } from './buses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Prisma } from '@prisma/client';

@Controller('buses')
export class BusesController {
  constructor(private readonly busesService: BusesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() createBusDto: Prisma.BusCreateInput) {
    return this.busesService.create(createBusDto);
  }

  @Get('nearby')
  findNearby(@Query('lat') lat: number, @Query('lng') lng: number, @Query('radius') radius: number) {
    return this.busesService.findNearby(lat, lng, radius);
  }

  @Get()
  findAll() {
    return this.busesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.busesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBusDto: Prisma.BusUpdateInput) {
    return this.busesService.update(id, updateBusDto);
  }
}
