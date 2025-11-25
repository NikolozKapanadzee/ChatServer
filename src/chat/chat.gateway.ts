import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { WsJwtGuard } from 'src/guards/ws-jwt.guard';
import { UserStatus } from 'src/enums/user-status.enum';
import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) throw new UnauthorizedException('Missing token');

      const decoded = this.jwtService.verify(token);
      client.data.user = decoded;
      client.data.token = token;

      await this.chatService.updateUserStatus(decoded.id, UserStatus.ONLINE);

      this.server.emit('user_status_changed', {
        userId: decoded.id,
        status: UserStatus.ONLINE,
      });

      console.log(`User ${decoded.id} connected → ONLINE`);
    } catch (e) {
      console.log('WS connection rejected:', e.message);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.user?.id;

    if (!userId) return;

    await this.chatService.updateUserStatus(userId, UserStatus.OFFLINE);

    this.server.emit('user_status_changed', {
      userId,
      status: UserStatus.OFFLINE,
    });

    console.log(`User ${userId} disconnected → OFFLINE`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('send_global_message')
  async handleGlobalMessage(
    @MessageBody() body: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.id;
    const message = await this.chatService.sendMessage(userId, body.content);

    this.server.emit('receive_global_message', message);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('send_private_message')
  async handlePrivateMessage(
    @MessageBody() body: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (!body.receiverId) return;

    const userId = client.data.user.id;

    const message = await this.chatService.sendPrivateMessage(
      userId,
      body.receiverId,
      body.content,
    );

    const room = this.getPrivateRoomName(userId, body.receiverId);
    this.server.to(room).emit('receive_private_message', message);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_private_room')
  async joinRoom(
    @MessageBody() { friendId }: { friendId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.getPrivateRoomName(client.data.user.id, friendId);
    client.join(room);

    console.log(`User ${client.data.user.id} joined room ${room}`);
  }
  private getPrivateRoomName(a: string, b: string) {
    return [a, b].sort().join('_');
  }
}
