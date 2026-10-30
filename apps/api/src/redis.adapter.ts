import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor?: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    try {
      const pubClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6380' });
      const subClient = pubClient.duplicate();

      // Suppress unhandled error events if redis is offline
      pubClient.on('error', (err) => console.warn('Redis pub error:', err.message));
      subClient.on('error', (err) => console.warn('Redis sub error:', err.message));

      await Promise.all([pubClient.connect(), subClient.connect()]);
      this.adapterConstructor = createAdapter(pubClient, subClient);
      console.log('Successfully connected to Redis WebSocket adapter');
    } catch (err: any) {
      console.warn('Could not connect to Redis, falling back to default in-memory adapter:', err?.message || err);
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }
    return server;
  }
}
