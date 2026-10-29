import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('room.join')
  handleJoinRoom(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
    client.join(data.room);
    console.log(`Client ${client.id} joined room ${data.room}`);
    return { event: 'joined', data: data.room };
  }

  @SubscribeMessage('driver.location.update')
  handleLocationUpdate(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    // Broadcast the update to the specific bus room and the admin fleet room
    this.server.to(`bus:${data.busId}`).emit('bus.location.updated', data);
    this.server.to('admin:fleet').emit('bus.location.updated', data);
    
    return { event: 'location.ack', status: 'ok' };
  }
}
