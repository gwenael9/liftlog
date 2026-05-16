import {
  Injectable,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { StringValue } from "ms";
import * as bcrypt from "bcryptjs";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

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
      throw new HttpException({ code: "EMAIL_ALREADY_IN_USE" }, HttpStatus.CONFLICT);
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
      throw new HttpException({ code: "INVALID_CREDENTIALS" }, HttpStatus.UNAUTHORIZED);
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );
    if (!passwordValid) {
      throw new HttpException({ code: "INVALID_CREDENTIALS" }, HttpStatus.UNAUTHORIZED);
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.storeRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async refresh(userId: string, rawRefreshToken: string): Promise<TokenPair> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refresh_token_hash) {
      throw new HttpException({ code: "ACCESS_DENIED" }, HttpStatus.UNAUTHORIZED);
    }

    const tokenValid = await bcrypt.compare(
      rawRefreshToken,
      user.refresh_token_hash,
    );
    if (!tokenValid) {
      throw new HttpException({ code: "INVALID_REFRESH_TOKEN" }, HttpStatus.UNAUTHORIZED);
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.storeRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<TokenPair> {
    const payload = { sub: userId, email };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET || "default_access_secret",
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as StringValue,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || "default_refresh_secret",
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as StringValue,
      }),
    ]);

    return { access_token, refresh_token };
  }

  private async storeRefreshTokenHash(
    userId: string,
    rawToken: string,
  ): Promise<void> {
    const hash = await bcrypt.hash(rawToken, 10);
    await this.usersService.updateRefreshTokenHash(userId, hash);
  }
}
