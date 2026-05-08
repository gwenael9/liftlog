import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

export interface JwtRefreshPayload {
  sub: string;
  email: string;
  refreshToken: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh_token'),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: string; email: string }): Promise<JwtRefreshPayload> {
    const refreshToken = req.body?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }
    return { sub: payload.sub, email: payload.email, refreshToken };
  }
}
