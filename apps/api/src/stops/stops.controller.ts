import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { StopsService } from './stops.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Prisma } from '@prisma/client';

@Controller('stops')
export class StopsController {
  constructor(private readonly stopsService: StopsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() createStopDto: Prisma.StopCreateInput) {
    return this.stopsService.create(createStopDto);
  }

  @Get('nearby')
  findNearby(@Query('lat') lat: number, @Query('lng') lng: number, @Query('radius') radius: number) {
    return this.stopsService.findNearby(lat, lng, radius);
  }

  @Get()
  findAll() {
    return this.stopsService.findAll();
  }
}
