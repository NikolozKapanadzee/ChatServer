import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient();
      const token = this.extractTokenFromHandshake(client);

      if (!token) {
        throw new WsException('Unauthorized: No token provided');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      client.data.user = payload;
      return true;
    } catch (error) {
      throw new WsException('Unauthorized: Invalid token');
    }
  }

  private extractTokenFromHandshake(client: any): string | null {
    const token =
      client.handshake?.auth?.token ||
      client.handshake?.query?.token ||
      client.handshake?.headers?.authorization?.split(' ')[1];

    return token || null;
  }
}
