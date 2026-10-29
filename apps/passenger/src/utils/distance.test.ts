import { getDistance, estimateTimeInMinutes } from './distance';

describe('Distance Utilities', () => {
  it('calculates the correct distance between two points', () => {
    const lat1 = 22.5645;
    const lon1 = 88.3433;
    const lat2 = 22.5630;
    const lon2 = 88.3430;

    const distance = getDistance(lat1, lon1, lat2, lon2);
    
    // Distance should be around 0.17 km
    expect(distance).toBeGreaterThan(0.1);
    expect(distance).toBeLessThan(0.2);
  });

  it('estimates time correctly based on average speed', () => {
    // 10 km at 25 km/h = 0.4 hours = 24 minutes
    const time = estimateTimeInMinutes(10, 25);
    expect(time).toBe(24);
  });

  it('handles zero distance', () => {
    const time = estimateTimeInMinutes(0);
    expect(time).toBe(0);
  });
});
