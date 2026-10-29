import { Injectable } from '@nestjs/common';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class SimulatorService {
  private simulationInterval: NodeJS.Timeout | null = null;
  private currentLat = 22.5645; // Kolkata (Esplanade)
  private currentLng = 88.3433;
  private isReversing = false;

  constructor(
    private eventsGateway: EventsGateway,
  ) {}

  async startSimulation(busId: string, tripId: string) {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
    
    // Start at Park Street
    this.currentLat = 22.5555;
    this.currentLng = 88.3510;
    
    // Target Tollygunge (22.4830, 88.3460)
    // We want the bus to reach there in about 60 seconds (60 ticks)
    const latStep = (22.4830 - 22.5555) / 60;
    const lngStep = (88.3460 - 88.3510) / 60;
    
    this.simulationInterval = setInterval(() => {
      // Simulate moving towards Tollygunge
      if (this.isReversing) {
        this.currentLat -= latStep; 
        this.currentLng -= lngStep;
      } else {
        this.currentLat += latStep; 
        this.currentLng += lngStep;
      }

      // If we go too far (reach Tollygunge), reverse direction
      if (this.currentLat < 22.4830) {
        this.isReversing = true;
      } else if (this.currentLat > 22.5555) {
        this.isReversing = false;
      }
      
      const payload = {
        busId,
        tripId,
        latitude: this.currentLat,
        longitude: this.currentLng,
        speed: 30, // constant 30 km/h display
        heading: this.isReversing ? 220 : 40, 
        timestamp: new Date().toISOString(),
      };
      
      if (this.eventsGateway.server) {
        this.eventsGateway.server.to(`bus:${busId}`).emit('bus.location.updated', payload);
        this.eventsGateway.server.to('admin:fleet').emit('bus.location.updated', payload);
      }
      
    }, 1000); 
    
    return { status: 'Simulation started on local mock route', busId, tripId };
  }

  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    return { status: 'Simulation stopped' };
  }
}
