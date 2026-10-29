import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { SimulatorService } from './simulator.service';

@Controller('simulator')
export class SimulatorController {
  constructor(private readonly simulatorService: SimulatorService) {}

  @Post('start')
  @HttpCode(200)
  start(@Body() body: { busId: string, tripId: string }) {
    return this.simulatorService.startSimulation(body.busId, body.tripId);
  }

  @Post('stop')
  @HttpCode(200)
  stop() {
    return this.simulatorService.stopSimulation();
  }

  @Post('create-demo')
  @HttpCode(200)
  async createDemo(@Body() body: { busNumber: string, routeNumber: string, stopsCount: number }) {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Find or create driver
    let driver = await prisma.driver.findFirst();
    if (!driver) {
      const user = await prisma.user.create({
        data: {
          email: 'demo-driver@busly.com',
          password: 'password',
          name: 'Demo Driver',
          role: 'DRIVER'
        }
      });
      driver = await prisma.driver.create({
        data: { userId: user.id, licenseNumber: 'DEMO-123', status: 'OFFLINE' }
      });
    }

    // Create bus
    const bus = await prisma.bus.create({
      data: {
        registrationNumber: body.busNumber,
        displayName: body.busNumber,
        capacity: 40,
        operator: 'DEMO',
        status: 'AVAILABLE',
        currentDriver: { connect: { id: driver.id } }
      }
    });

    // Create stops array
    const stopsData = [];
    for(let i=0; i < body.stopsCount; i++) {
      stopsData.push({
        name: `Stop ${i+1}`,
        latitude: 22.5555 - (i * 0.01),
        longitude: 88.3510 - (i * 0.001),
        sequence: i + 1
      });
    }

    // Create Route
    const route = await prisma.route.create({
      data: {
        origin: 'Park Street',
        destination: 'Tollygunge',
        polyline: body.routeNumber, // HACK for demo: store route number here
        stops: { create: stopsData }
      }
    });

    // Create Trip
    const trip = await prisma.trip.create({
      data: {
        busId: bus.id,
        driverId: driver.id,
        routeId: route.id,
        status: 'SCHEDULED',
        scheduledStart: new Date(Date.now() + 60000)
      }
    });

    await prisma.$disconnect();
    return { tripId: trip.id, busId: bus.id, routeId: route.id };
  }
}
