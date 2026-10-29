import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BusesModule } from './buses/buses.module';
import { DriversModule } from './drivers/drivers.module';
import { RoutesModule } from './routes/routes.module';
import { TripsModule } from './trips/trips.module';
import { StopsModule } from './stops/stops.module';
import { EventsModule } from './events/events.module';
import { SimulatorModule } from './simulator/simulator.module';

@Module({
  imports: [PrismaModule, AuthModule, BusesModule, DriversModule, RoutesModule, TripsModule, StopsModule, EventsModule, SimulatorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
