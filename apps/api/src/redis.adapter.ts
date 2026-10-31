import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor?: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      console.log('No REDIS_URL provided. Using default in-memory WebSocket adapter.');
      return;
    }

    let pubClient;
    let subClient;
    try {
      pubClient = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => (retries >= 3 ? false : Math.min(retries * 1000, 3000)),
        },
      });
      subClient = pubClient.duplicate();

      pubClient.on('error', (err) => console.warn('Redis pub warning:', err.message));
      subClient.on('error', (err) => console.warn('Redis sub warning:', err.message));

      await Promise.all([pubClient.connect(), subClient.connect()]);
      this.adapterConstructor = createAdapter(pubClient, subClient);
      console.log('Successfully connected to Redis WebSocket adapter');
    } catch (err: any) {
      console.warn('Could not connect to Redis, falling back to default in-memory adapter:', err?.message || err);
      try { pubClient?.disconnect(); } catch {}
      try { subClient?.disconnect(); } catch {}
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
