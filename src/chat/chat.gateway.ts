import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from 'src/guards/ws-jwt.guard';
import { UserStatus } from 'src/enums/user-status.enum';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    if (client.data.user?.id) {
      await this.chatService.updateUserStatus(
        client.data.user.id,
        UserStatus.OFFLINE,
      );

      this.server.emit('user_status_changed', {
        userId: client.data.user.id,
        status: UserStatus.OFFLINE,
      });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('send_global_message')
  async handleGlobalMessage(
    @MessageBody() body: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = client.data.user.id;
      const message = await this.chatService.sendMessage(userId, body.content);
      this.server.emit('receive_global_message', message);
    } catch (error) {
      console.error('Error sending message:', error);
      client.emit('error', { message: error.message });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('send_private_message')
  async handlePrivateMessage(
    @MessageBody() body: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (!body.receiverId) {
      client.emit('error', {
        message: 'receiverId is required for private messages',
      });
      return;
    }
    try {
      const userId = client.data.user.id;

      const message = await this.chatService.sendPrivateMessage(
        userId,
        body.receiverId,
        body.content,
      );

      const roomName = this.getPrivateRoomName(userId, body.receiverId);
      this.server.to(roomName).emit('receive_private_message', message);
    } catch (error) {
      console.error('Error in private message:', error);
      client.emit('error', { message: error.message });
    }
  }

  private getPrivateRoomName(user1: string, user2: string) {
    return [user1, user2].sort().join('_');
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_private_room')
  async handleJoinRoom(
    @MessageBody() { friendId }: { friendId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.id;
    const room = this.getPrivateRoomName(userId, friendId);
    client.join(room);
    console.log(`User ${userId} joined room ${room}`);
  }
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('user_connected')
  async handleUserConnected(@ConnectedSocket() client: Socket) {
    const userId = client.data.user.id;

    await this.chatService.updateUserStatus(userId, UserStatus.ONLINE);

    this.server.emit('user_status_changed', {
      userId: userId,
      status: UserStatus.ONLINE,
    });

    console.log(`User ${userId} is now ONLINE`);
  }
}
