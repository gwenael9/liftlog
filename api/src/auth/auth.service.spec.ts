import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, HttpStatus } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { Sex, UnitSystem, UserRole } from "../users/entities/user.entity";
import { jest, describe, beforeEach, it, expect } from "@jest/globals";

jest.mock("bcryptjs");

describe("AuthService", () => {
  let service: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

  const user = {
    id: "user-1",
    email: "user@example.com",
    password_hash: "hashed_password",
    display_name: null,
    unit_system: UnitSystem.KG,
    role: UserRole.USER,
    sex: Sex.MALE,
    preferences: {},
    refresh_token_hash: "hashed_refresh_token",
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateRefreshTokenHash: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue("signed_token"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_value");
  });

  describe("register", () => {
    it("throws CONFLICT when email already used", async () => {
      usersService.findByEmail!.mockResolvedValue(user);

      await expect(
        service.register({ email: user.email, password: "password123" }),
      ).rejects.toMatchObject({
        status: HttpStatus.CONFLICT,
        response: { code: "EMAIL_ALREADY_IN_USE" },
      });
    });

    it("creates user, hashes password, stores refresh token, returns tokens", async () => {
      usersService.findByEmail!.mockResolvedValue(null);
      usersService.create!.mockResolvedValue(user);
      jwtService
        .signAsync!.mockResolvedValueOnce("access_token")
        .mockResolvedValueOnce("refresh_token");

      const result = await service.register({
        email: user.email,
        password: "password123",
      });

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 12);
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: user.email }),
      );
      expect(usersService.updateRefreshTokenHash).toHaveBeenCalledWith(
        user.id,
        createHash("sha256").update("refresh_token").digest("hex"),
      );
      expect(result).toEqual({
        access_token: "access_token",
        refresh_token: "refresh_token",
      });
    });
  });

  describe("login", () => {
    it("throws UNAUTHORIZED when user not found", async () => {
      usersService.findByEmail!.mockResolvedValue(null);

      await expect(
        service.login({ email: "nobody@example.com", password: "x" }),
      ).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
        response: { code: "INVALID_CREDENTIALS" },
      });
    });

    it("throws UNAUTHORIZED when password invalid", async () => {
      usersService.findByEmail!.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: user.email, password: "wrong" }),
      ).rejects.toThrow(HttpException);
    });

    it("returns tokens on valid credentials", async () => {
      usersService.findByEmail!.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: user.email,
        password: "password123",
      });

      expect(result).toEqual({
        access_token: "signed_token",
        refresh_token: "signed_token",
      });
    });
  });

  describe("refresh", () => {
    it("throws UNAUTHORIZED when user missing", async () => {
      usersService.findById!.mockResolvedValue(null);

      await expect(service.refresh(user.id, "raw_token")).rejects.toMatchObject(
        { response: { code: "ACCESS_DENIED" } },
      );
    });

    it("throws UNAUTHORIZED when no stored refresh token hash", async () => {
      usersService.findById!.mockResolvedValue({
        ...user,
        refresh_token_hash: null,
      });

      await expect(service.refresh(user.id, "raw_token")).rejects.toMatchObject(
        { response: { code: "ACCESS_DENIED" } },
      );
    });

    it("throws UNAUTHORIZED when refresh token mismatches stored hash", async () => {
      usersService.findById!.mockResolvedValue({
        ...user,
        refresh_token_hash: createHash("sha256")
          .update("a_different_token")
          .digest("hex"),
      });

      await expect(
        service.refresh(user.id, "stale_token"),
      ).rejects.toMatchObject({ response: { code: "INVALID_REFRESH_TOKEN" } });
    });

    it("rotates tokens on valid refresh token", async () => {
      usersService.findById!.mockResolvedValue({
        ...user,
        refresh_token_hash: createHash("sha256")
          .update("valid_token")
          .digest("hex"),
      });

      const result = await service.refresh(user.id, "valid_token");

      expect(usersService.updateRefreshTokenHash).toHaveBeenCalled();
      expect(result).toEqual({
        access_token: "signed_token",
        refresh_token: "signed_token",
      });
    });
  });
});
