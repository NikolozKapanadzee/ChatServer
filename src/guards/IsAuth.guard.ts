import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class IsAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = this.getTokenFromHeadrs(req.headers);
    if (!token) {
      return false;
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      req.user = { _id: payload.id };
    } catch (e) {
      throw new UnauthorizedException('token expired');
    }

    return true;
  }

  getTokenFromHeadrs(headers) {
    const authorization = headers['authorization'];
    if (!authorization) return null;

    const [type, token] = authorization.split(' ');

    return type === 'Bearer' ? token : null;
  }
}
