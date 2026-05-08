import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<TokenPair> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const password_hash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      email: dto.email,
      password_hash,
      display_name: dto.display_name ?? null,
    });

    const tokens = await this.generateTokens(user.id, user.email);
    await this.storeRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async login(dto: LoginDto): Promise<TokenPair> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.storeRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async refresh(userId: string, rawRefreshToken: string): Promise<TokenPair> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refresh_token_hash) {
      throw new UnauthorizedException('Access denied');
    }

    const tokenValid = await bcrypt.compare(rawRefreshToken, user.refresh_token_hash);
    if (!tokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.storeRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  private async generateTokens(userId: string, email: string): Promise<TokenPair> {
    const payload = { sub: userId, email };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET || 'default_access_secret',
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as StringValue,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as StringValue,
      }),
    ]);

    return { access_token, refresh_token };
  }

  private async storeRefreshTokenHash(userId: string, rawToken: string): Promise<void> {
    const hash = await bcrypt.hash(rawToken, 10);
    await this.usersService.updateRefreshTokenHash(userId, hash);
  }
}
