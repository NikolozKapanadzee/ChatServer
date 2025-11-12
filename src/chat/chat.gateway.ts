import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class Gateway implements OnGatewayConnection {
  @WebSocketServer()
  private server: Server;

  handleConnection(client: any, ...args: any[]) {
    console.log(`Connected ${client.id}`);
  }

  @SubscribeMessage('echo')
  echoServer(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
    console.log(body);
    client.emit('echo', body);
  }

  @SubscribeMessage('send_public_message')
  sendPublicMessage(@MessageBody() body: any) {
    this.server.emit('send_public_message', body);
  }
  @SubscribeMessage('join_room')
  joinRoom(
    @MessageBody() { roomId }: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(roomId);
  }
  @SubscribeMessage('send_private_message')
  sendPrivateMessage(@MessageBody() { roomId, msg }) {
    this.server.to(roomId).emit('send_private_message', { msg });
  }
}
