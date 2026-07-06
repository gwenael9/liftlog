import { INestApplication } from "@nestjs/common";
import { DataSource } from "typeorm";
import * as request from "supertest";
import { createTestApp, clearDatabase } from "./utils/test-app";

describe("Auth (e2e)", () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());
  });

  afterEach(async () => {
    await clearDatabase(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  const credentials = { email: "jane@example.com", password: "password123" };

  describe("POST /auth/register", () => {
    it("creates a user and returns a token pair", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/register")
        .send(credentials)
        .expect(201);

      expect(res.body).toEqual({
        access_token: expect.any(String),
        refresh_token: expect.any(String),
      });
    });

    it("rejects duplicate email with 409", async () => {
      await request(app.getHttpServer()).post("/auth/register").send(credentials);

      const res = await request(app.getHttpServer())
        .post("/auth/register")
        .send(credentials)
        .expect(409);

      expect(res.body.code).toBe("EMAIL_ALREADY_IN_USE");
    });

    it("rejects invalid payload with 400", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({ email: "not-an-email", password: "short" })
        .expect(400);
    });
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      await request(app.getHttpServer()).post("/auth/register").send(credentials);
    });

    it("returns tokens for valid credentials", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send(credentials)
        .expect(200);

      expect(res.body).toEqual({
        access_token: expect.any(String),
        refresh_token: expect.any(String),
      });
    });

    it("rejects wrong password with 401", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: credentials.email, password: "wrong_password" })
        .expect(401);

      expect(res.body.code).toBe("INVALID_CREDENTIALS");
    });

    it("rejects unknown email with 401", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: "nobody@example.com", password: "password123" })
        .expect(401);
    });
  });

  describe("POST /auth/refresh", () => {
    it("rotates the token pair with a valid refresh token", async () => {
      const registerRes = await request(app.getHttpServer())
        .post("/auth/register")
        .send(credentials);

      const res = await request(app.getHttpServer())
        .post("/auth/refresh")
        .send({ refresh_token: registerRes.body.refresh_token })
        .expect(200);

      expect(res.body).toEqual({
        access_token: expect.any(String),
        refresh_token: expect.any(String),
      });
    });

    it("rejects a missing refresh token with 401", async () => {
      await request(app.getHttpServer())
        .post("/auth/refresh")
        .send({})
        .expect(401);
    });

    it("rejects a stale refresh token after rotation", async () => {
      const registerRes = await request(app.getHttpServer())
        .post("/auth/register")
        .send(credentials);
      const staleToken = registerRes.body.refresh_token;

      await request(app.getHttpServer())
        .post("/auth/refresh")
        .send({ refresh_token: staleToken })
        .expect(200);

      await request(app.getHttpServer())
        .post("/auth/refresh")
        .send({ refresh_token: staleToken })
        .expect(401);
    });
  });
});
