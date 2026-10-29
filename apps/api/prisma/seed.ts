import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with Kolkata demo data...');
  
  // Clean up existing
  await prisma.liveLocation.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.seat.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.stop.deleteMany({});
  await prisma.route.deleteMany({});
  await prisma.bus.deleteMany({});
  await prisma.driver.deleteMany({});
  await prisma.user.deleteMany({});

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@busly.com',
      password: adminPassword,
      name: 'System Admin',
      role: 'ADMIN',
    },
  });
  console.log(`Created admin: ${admin.email}`);

  // Create Drivers
  const drivers = [];
  for (let i = 1; i <= 3; i++) {
    const dPassword = await bcrypt.hash('driver123', 10);
    const dUser = await prisma.user.create({
      data: {
        phone: `999999999${i}`,
        password: dPassword,
        name: `Driver ${i}`,
        role: 'DRIVER',
        driver: {
          create: {
            licenseNumber: `WB-04-1234${i}`,
            status: 'OFFLINE',
          },
        },
      },
    });
    const d = await prisma.driver.findUnique({ where: { userId: dUser.id } });
    drivers.push(d!);
  }

  // Create Buses
  const buses = [];
  for (let i = 1; i <= 3; i++) {
    const b = await prisma.bus.create({
      data: {
        registrationNumber: `WB-04-A-123${i}`,
        displayName: `VOLVO-AC-0${i}`,
        capacity: 40,
        operator: 'WBTC',
        status: 'AVAILABLE',
        currentDriver: {
          connect: { id: drivers[i-1].id },
        },
      },
    });
    buses.push(b);
  }

  // Create Route (Park Street to Tollygunge)
  const route = await prisma.route.create({
    data: {
      origin: 'Park Street',
      destination: 'Tollygunge',
      polyline: '',
      stops: {
        create: [
          { name: 'Park Street', latitude: 22.5555, longitude: 88.3510, sequence: 1 },
          { name: 'Exide Crossing', latitude: 22.5405, longitude: 88.3470, sequence: 2 },
          { name: 'Hazra Crossing', latitude: 22.5250, longitude: 88.3450, sequence: 3 },
          { name: 'Ballygunge Phari', latitude: 22.5280, longitude: 88.3660, sequence: 4 },
          { name: 'Gariahat', latitude: 22.5170, longitude: 88.3670, sequence: 5 },
          { name: 'Dhakuria', latitude: 22.5080, longitude: 88.3660, sequence: 6 },
          { name: 'Jadavpur Thana', latitude: 22.4970, longitude: 88.3630, sequence: 7 },
          { name: 'Tollygunge', latitude: 22.4830, longitude: 88.3460, sequence: 8 },
        ],
      },
    },
  });

  // Create Scheduled Trips (1m, 5m, 10m away)
  const offsets = [60000, 300000, 600000]; // 1m, 5m, 10m
  for (let i = 0; i < 3; i++) {
    await prisma.trip.create({
      data: {
        busId: buses[i].id,
        driverId: drivers[i].id,
        routeId: route.id,
        status: 'SCHEDULED',
        scheduledStart: new Date(Date.now() + offsets[i]),
      },
    });
  }
  
  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
